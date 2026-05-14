import {
  triageResultSchema,
  type GuidelineCitation,
  type SeverityLevel,
  type TriageResult,
} from '@jeevansetu/types';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';

import { features } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { getChatModel } from '../../lib/ai.js';
import { retrieveGuidelines } from '../rag/rag.service.js';
import {
  buildTriageUserPrompt,
  TRIAGE_SYSTEM_PROMPT,
  type TriageContext,
} from './triage.prompts.js';

/**
 * Phase 6 — AI Triage Engine (LangGraph workflow).
 *
 * Graph:  retrieve(guidelines) → assess(LLM, structured + retry) → reconcile(safety override)
 *
 * Guarantees:
 *  • Structured JSON output enforced via Zod-bound structured output.
 *  • Up to MAX_ATTEMPTS retries on validation failure (hallucination guard).
 *  • The deterministic safety verdict is applied AFTER the model, never below
 *    CRITICAL — the model can never downgrade a safety-flagged patient.
 *  • If Gemini is not configured the engine returns a deterministic, clearly
 *    labelled heuristic baseline so the pipeline still produces a reviewable
 *    assessment for the doctor.
 */

const MAX_ATTEMPTS = 3;

export interface TriageEngineResult {
  result: TriageResult;
  citations: GuidelineCitation[];
  reasoningText: string;
  rawOutput: unknown;
  model: string;
  attempts: number;
  usedFallback: boolean;
}

const TriageState = Annotation.Root({
  context: Annotation<TriageContext>(),
  citations: Annotation<GuidelineCitation[]>({ reducer: (_p, n) => n, default: () => [] }),
  result: Annotation<TriageResult | null>({ reducer: (_p, n) => n, default: () => null }),
  attempts: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),
  rawOutput: Annotation<unknown>({ reducer: (_p, n) => n, default: () => null }),
  usedFallback: Annotation<boolean>({ reducer: (_p, n) => n, default: () => false }),
});

type State = typeof TriageState.State;

async function retrieveNode(state: State): Promise<Partial<State>> {
  const ctx = state.context;
  const query = `${ctx.primarySymptom}. ${ctx.secondarySymptoms.join(', ')}. ${ctx.chiefComplaint ?? ''}`;
  const citations = await retrieveGuidelines(query, 5);
  return { citations };
}

async function assessNode(state: State): Promise<Partial<State>> {
  if (!features.ai) {
    return { result: heuristicAssessment(state.context), usedFallback: true, attempts: 0 };
  }

  const model = getChatModel().withStructuredOutput(triageResultSchema, { name: 'triage_assessment' });
  const messages = [
    new SystemMessage(TRIAGE_SYSTEM_PROMPT),
    new HumanMessage(buildTriageUserPrompt(state.context, state.citations)),
  ];

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await model.invoke(messages);
      // Structured output already conforms, but we re-validate defensively.
      const parsed = triageResultSchema.parse(raw);
      return { result: parsed, rawOutput: raw, attempts: attempt, usedFallback: false };
    } catch (err) {
      lastError = err;
      logger.warn({ err, attempt }, 'Triage assessment attempt failed; retrying');
      messages.push(
        new HumanMessage(
          'Your previous response did not conform to the required schema. Return ONLY a valid structured triage assessment.',
        ),
      );
    }
  }

  logger.error({ err: lastError }, 'Triage AI failed after retries — using heuristic fallback');
  return { result: heuristicAssessment(state.context), usedFallback: true, attempts: MAX_ATTEMPTS };
}

/**
 * Reconcile the model's severity with the deterministic safety verdict. Rules
 * always override AI: a safety-critical patient is forced to CRITICAL/ESI 1.
 */
function reconcileNode(state: State): Partial<State> {
  const result = state.result;
  if (!result) return {};
  if (state.context.safety.isCritical && result.severity !== 'CRITICAL') {
    const forced: TriageResult = {
      ...result,
      severity: 'CRITICAL',
      esiLevel: 1,
      reasoning: `[SAFETY OVERRIDE] Deterministic safety rules (${state.context.safety.triggeredRules
        .map((r) => r.label)
        .join('; ')}) force CRITICAL severity. Original model reasoning: ${result.reasoning}`,
      redFlags: dedupe([...result.redFlags, ...state.context.safety.triggeredRules.map((r) => r.label)]),
    };
    return { result: forced };
  }
  return {};
}

const graph = new StateGraph(TriageState)
  .addNode('retrieve', retrieveNode)
  .addNode('assess', assessNode)
  .addNode('reconcile', reconcileNode)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'assess')
  .addEdge('assess', 'reconcile')
  .addEdge('reconcile', END)
  .compile();

export async function runTriage(context: TriageContext): Promise<TriageEngineResult> {
  const final = await graph.invoke({ context });
  const result = final.result ?? heuristicAssessment(context);
  return {
    result,
    citations: final.citations,
    reasoningText: result.reasoning,
    rawOutput: final.rawOutput,
    model: final.usedFallback ? 'deterministic-fallback' : process.env.GEMINI_TRIAGE_MODEL ?? 'gemini-2.0-flash',
    attempts: final.attempts,
    usedFallback: final.usedFallback,
  };
}

// ── Deterministic fallback ─────────────────────────────────────────────────────
// Not a placeholder: a transparent, rule-based baseline that keeps the human
// review loop functional when the LLM is unavailable. Clearly labelled as such.

function heuristicAssessment(ctx: TriageContext): TriageResult {
  const severity: SeverityLevel = ctx.safety.isCritical ? 'CRITICAL' : deriveHeuristicSeverity(ctx);
  const esiLevel = severity === 'CRITICAL' ? 1 : severity === 'HIGH' ? 2 : severity === 'MODERATE' ? 3 : 4;

  return {
    severity,
    esiLevel,
    confidence: 0.4,
    reasoning: ctx.safety.isCritical
      ? `[HEURISTIC FALLBACK] Safety engine flagged CRITICAL via: ${ctx.safety.triggeredRules
          .map((r) => r.label)
          .join('; ')}. AI model unavailable; doctor review required.`
      : `[HEURISTIC FALLBACK] AI model unavailable. Severity derived from vital-sign thresholds and reported symptom severity. Treat as provisional pending doctor review.`,
    possibleConditions: [{ condition: 'Undetermined — clinical correlation required', likelihood: 'MODERATE' }],
    recommendedDepartment: ctx.safety.isCritical ? 'Emergency' : 'General Medicine',
    recommendedTests: [],
    riskFactors: ctx.patient.existingDiseases,
    redFlags: ctx.safety.triggeredRules.map((r) => r.label),
  };
}

function deriveHeuristicSeverity(ctx: TriageContext): SeverityLevel {
  const v = ctx.vitals;
  const spo2 = num(v.oxygenSaturation);
  const hr = num(v.heartRate);
  const sbp = num(v.systolicBp);
  if ((spo2 !== null && spo2 < 94) || (hr !== null && (hr > 120 || hr < 50)) || (sbp !== null && sbp < 100)) {
    return 'HIGH';
  }
  if (ctx.primarySymptom.toLowerCase().includes('pain')) return 'MODERATE';
  return 'LOW';
}

function num(v: number | boolean | undefined): number | null {
  return typeof v === 'number' ? v : null;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
