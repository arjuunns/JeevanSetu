import './load-env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { runSafetyScreen, type SafetyInput } from '../src/modules/safety/safety.engine.js';
import { runTriage } from '../src/modules/triage/triage.engine.js';
import type { TriageContext } from '../src/modules/triage/triage.prompts.js';
import { env } from '../src/config/env.js';

interface BenchmarkCase {
  stayId: string;
  subjectId: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  existingDiseases: string[];
  medications: string[];
  allergies: string[];
  chiefComplaint: string;
  arrivalTransport: string;
  disposition: string;
  groundTruthEsi: number;
  groundTruthSeverity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  vitals: {
    temperatureC?: number;
    oxygenSaturation?: number;
    heartRate?: number;
    respiratoryRate?: number;
    systolicBp?: number;
    diastolicBp?: number;
    glasgowComaScale?: number;
    isUnconscious?: boolean;
  };
  symptoms: Array<{
    name: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    isPrimary: boolean;
  }>;
  confirmedDiagnoses: string[];
}

interface EvaluationResult {
  stayId: string;
  patientName: string;
  chiefComplaint: string;
  groundTruthEsi: number;
  predictedEsi: number;
  groundTruthSeverity: string;
  predictedSeverity: string;
  isExactMatch: boolean;
  isWithinOneLevel: boolean;
  isUnderTriaged: boolean; // DANGEROUS: Predicted ESI > Ground Truth ESI (e.g. true 2 predicted as 3)
  isOverTriaged: boolean;  // SAFE: Predicted ESI < Ground Truth ESI (e.g. true 3 predicted as 2)
  safetyTriggered: boolean;
  recommendedDepartment?: string;
  latencyMs: number;
  reasoning: string;
  model: string;
}

// Parse CLI flags: --limit=N, --provider=ollama|gemini, --model=NAME
const args = process.argv.slice(2);
let limit = 150;
let providerOverride: string | null = null;
let modelOverride: string | null = null;

for (const arg of args) {
  if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.split('=')[1], 10) || 150;
  } else if (arg.startsWith('--provider=')) {
    providerOverride = arg.split('=')[1];
  } else if (arg.startsWith('--model=')) {
    modelOverride = arg.split('=')[1];
  }
}

async function checkOllamaHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/api/tags`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const currentProvider = providerOverride ?? env.LLM_PROVIDER ?? 'ollama';
  const currentModel = modelOverride ?? (currentProvider === 'ollama' ? env.OLLAMA_MODEL : env.GEMINI_TRIAGE_MODEL);

  console.log('\n===============================================================');
  console.log('🩺 JeevanSetu Clinical Triage Benchmark — MIMIC-IV-ED Cohort');
  console.log('===============================================================');
  console.log(`• Provider:         ${currentProvider.toUpperCase()}`);
  console.log(`• Model:            ${currentModel}`);
  console.log(`• Cohort Size:      ${limit} Patients`);
  console.log(`• Timestamp:        ${new Date().toISOString()}`);
  console.log('===============================================================\n');

  if (currentProvider === 'ollama') {
    const ollamaUrl = env.OLLAMA_BASE_URL.replace('host.docker.internal', 'localhost');
    const isUp = await checkOllamaHealth(ollamaUrl);
    if (!isUp) {
      console.error(`⚠️  Ollama server is not reachable at ${ollamaUrl}`);
      console.error(`👉 Please run: 'ollama serve' in another terminal and try again.`);
      console.error(`👉 Ensure model is pulled: 'ollama run ${currentModel}'\n`);
      process.exit(1);
    }
  }

  const dataPath = path.resolve(__dirname, '../../../data/mimic_benchmark_150.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Benchmark dataset not found at ${dataPath}.`);
    process.exit(1);
  }

  const allCases: BenchmarkCase[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const cases = allCases.slice(0, limit);

  const results: EvaluationResult[] = [];
  let exactMatches = 0;
  let withinOneLevelMatches = 0;
  let underTriagedCount = 0;
  let overTriagedCount = 0;
  let totalLatency = 0;

  // Confusion matrix: [actual ESI 1..5][predicted ESI 1..5]
  const confusionMatrix: number[][] = Array.from({ length: 6 }, () => Array(6).fill(0));

  console.log(`🚀 Executing triage evaluations across ${cases.length} clinical presentations...\n`);

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const indexStr = `[${i + 1}/${cases.length}]`.padEnd(9);

    // 1. Run Deterministic Safety Screen
    const safetyInput: SafetyInput = {
      vitals: {
        temperatureC: c.vitals.temperatureC,
        oxygenSaturation: c.vitals.oxygenSaturation,
        heartRate: c.vitals.heartRate,
        respiratoryRate: c.vitals.respiratoryRate,
        systolicBp: c.vitals.systolicBp,
        diastolicBp: c.vitals.diastolicBp,
        glasgowComaScale: c.vitals.glasgowComaScale,
        isUnconscious: c.vitals.isUnconscious ?? false,
      },
      symptoms: c.symptoms.map((s) => ({ name: s.name, severity: s.severity })),
    };
    const safety = runSafetyScreen(safetyInput, new Date().toISOString());

    // 2. Build Triage Context
    const primary = c.symptoms.find((s) => s.isPrimary) ?? c.symptoms[0];
    const triageContext: TriageContext = {
      patient: {
        age: c.age,
        gender: c.gender,
        allergies: c.allergies,
        existingDiseases: c.existingDiseases,
        medications: c.medications,
      },
      vitals: safetyInput.vitals as Record<string, number | boolean | undefined>,
      primarySymptom: primary?.name ?? c.chiefComplaint,
      secondarySymptoms: c.symptoms.filter((s) => !s.isPrimary).map((s) => s.name),
      chiefComplaint: c.chiefComplaint,
      safety,
    };

    const startTime = Date.now();
    let engineResult;
    try {
      engineResult = await runTriage(triageContext);
    } catch (err: any) {
      console.error(`❌ Case ${i + 1} failed:`, err.message || err);
      continue;
    }
    const latencyMs = Date.now() - startTime;
    totalLatency += latencyMs;

    const predEsi = engineResult.result.esiLevel ?? 3;
    const actualEsi = c.groundTruthEsi;

    const isExact = predEsi === actualEsi;
    const isWithinOne = Math.abs(predEsi - actualEsi) <= 1;
    const isUnder = predEsi > actualEsi; // Predicted higher number = lower urgency (Dangerous)
    const isOver = predEsi < actualEsi;  // Predicted lower number = higher urgency (Safe)

    if (isExact) exactMatches++;
    if (isWithinOne) withinOneLevelMatches++;
    if (isUnder) underTriagedCount++;
    if (isOver) overTriagedCount++;

    if (actualEsi >= 1 && actualEsi <= 5 && predEsi >= 1 && predEsi <= 5) {
      confusionMatrix[actualEsi][predEsi]++;
    }

    const evalRecord: EvaluationResult = {
      stayId: c.stayId,
      patientName: c.patientName,
      chiefComplaint: c.chiefComplaint,
      groundTruthEsi: actualEsi,
      predictedEsi: predEsi,
      groundTruthSeverity: c.groundTruthSeverity,
      predictedSeverity: engineResult.result.severity,
      isExactMatch: isExact,
      isWithinOneLevel: isWithinOne,
      isUnderTriaged: isUnder,
      isOverTriaged: isOver,
      safetyTriggered: safety.isCritical,
      recommendedDepartment: engineResult.result.recommendedDepartment,
      latencyMs,
      reasoning: engineResult.reasoningText,
      model: engineResult.model,
    };
    results.push(evalRecord);

    const matchTag = isExact
      ? '🟢 EXACT'
      : isWithinOne
        ? '🟡 ±1 LEVEL'
        : isUnder
          ? '🔴 UNDER-TRIAGED'
          : '🔵 OVER-TRIAGED';

    console.log(
      `${indexStr} ESI Actual: ${actualEsi} | Pred: ${predEsi} (${matchTag.padEnd(16)}) | ${latencyMs}ms | ${c.chiefComplaint.slice(0, 32)}`
    );
  }

  const evaluatedCount = results.length;
  const exactRate = ((exactMatches / evaluatedCount) * 100).toFixed(1);
  const withinOneRate = ((withinOneLevelMatches / evaluatedCount) * 100).toFixed(1);
  const underTriageRate = ((underTriagedCount / evaluatedCount) * 100).toFixed(1);
  const overTriageRate = ((overTriagedCount / evaluatedCount) * 100).toFixed(1);
  const avgLatency = Math.round(totalLatency / evaluatedCount);

  console.log('\n===============================================================');
  console.log('📊 CLINICAL BENCHMARK EVALUATION SUMMARY');
  console.log('===============================================================');
  console.log(`• Total Patients Evaluated:       ${evaluatedCount}`);
  console.log(`• Exact ESI Concordance Rate:     ${exactRate}% (${exactMatches}/${evaluatedCount})`);
  console.log(`• Clinically Acceptable (±1 ESI): ${withinOneRate}% (${withinOneLevelMatches}/${evaluatedCount})`);
  console.log(`• Under-Triage Risk Rate:         ${underTriageRate}% (${underTriagedCount}/${evaluatedCount}) [Lower is better]`);
  console.log(`• Over-Triage Rate (Safe guard):  ${overTriageRate}% (${overTriagedCount}/${evaluatedCount})`);
  console.log(`• Average Inference Latency:      ${avgLatency} ms`);
  console.log('===============================================================');

  // Print Confusion Matrix
  console.log('\n🔍 ESI Triage Confusion Matrix (Rows = Actual Ground Truth, Cols = Predicted)');
  console.log('---------------------------------------------------------------');
  console.log('Actual \\ Pred |   ESI 1   |   ESI 2   |   ESI 3   |   ESI 4   |   ESI 5   |');
  console.log('---------------------------------------------------------------');
  for (let act = 1; act <= 4; act++) {
    const row = [1, 2, 3, 4, 5].map((pred) => String(confusionMatrix[act][pred]).padStart(7)).join(' | ');
    console.log(`    ESI ${act}     | ${row} |`);
  }
  console.log('---------------------------------------------------------------\n');

  // Save detailed results JSON and Markdown Report
  const outJsonPath = path.resolve(__dirname, '../../../mimic_benchmark_results.json');
  fs.writeFileSync(outJsonPath, JSON.stringify({ summary: { evaluatedCount, exactRate, withinOneRate, underTriageRate, overTriageRate, avgLatency }, results }, null, 2));

  const reportMd = generateMarkdownReport({
    provider: currentProvider,
    model: currentModel,
    evaluatedCount,
    exactRate,
    withinOneRate,
    underTriageRate,
    overTriageRate,
    avgLatency,
    confusionMatrix,
    results,
  });

  const outMdPath = path.resolve(__dirname, '../../../mimic_benchmark_report.md');
  fs.writeFileSync(outMdPath, reportMd);

  console.log(`💾 Results saved to:\n  • JSON: ${outJsonPath}\n  • Markdown: ${outMdPath}\n`);
}

function generateMarkdownReport(data: any): string {
  return `# JeevanSetu Clinical Triage Benchmark Report

**Dataset:** MIMIC-IV-ED De-Identified Real-World Emergency Presentations  
**Model Under Test:** \`${data.model}\` (${data.provider.toUpperCase()})  
**Evaluation Date:** ${new Date().toISOString()}  

---

## 1. Executive Performance Metrics

| Metric | Score | Clinical Interpretation |
| :--- | :--- | :--- |
| **Total Cohort Size** | **${data.evaluatedCount} Patients** | Real-world emergency presentations |
| **Exact ESI Accuracy** | **${data.exactRate}%** | Exact match with expert ED triage consensus |
| **Clinically Acceptable (±1 Level)** | **${data.withinOneRate}%** | Safe triage boundary according to AHRQ standards |
| **Under-Triage Rate** | **${data.underTriageRate}%** | Critical safety metric (minimizing delayed care) |
| **Over-Triage Rate** | **${data.overTriageRate}%** | Conservative safety margin |
| **Mean Inference Latency** | **${data.avgLatency} ms** | Real-time response speed per patient |

---

## 2. ESI Acuity Confusion Matrix

| Ground Truth \\ Predicted | Predicted ESI 1 (Resuscitation) | Predicted ESI 2 (Emergent) | Predicted ESI 3 (Urgent) | Predicted ESI 4 (Less Urgent) |
| :--- | :---: | :---: | :---: | :---: |
| **Actual ESI 1 (Critical)** | **${data.confusionMatrix[1][1]}** | ${data.confusionMatrix[1][2]} | ${data.confusionMatrix[1][3]} | ${data.confusionMatrix[1][4]} |
| **Actual ESI 2 (Emergent)** | ${data.confusionMatrix[2][1]} | **${data.confusionMatrix[2][2]}** | ${data.confusionMatrix[2][3]} | ${data.confusionMatrix[2][4]} |
| **Actual ESI 3 (Urgent)** | ${data.confusionMatrix[3][1]} | ${data.confusionMatrix[3][2]} | **${data.confusionMatrix[3][3]}** | ${data.confusionMatrix[3][4]} |
| **Actual ESI 4 (Non-Urgent)** | ${data.confusionMatrix[4][1]} | ${data.confusionMatrix[4][2]} | ${data.confusionMatrix[4][3]} | **${data.confusionMatrix[4][4]}** |

---

## 3. Sample Case Evaluations

${data.results
  .slice(0, 10)
  .map(
    (r: any, idx: number) => `### Case ${idx + 1}: ${r.patientName} (${r.chiefComplaint})
- **Ground Truth:** ESI ${r.groundTruthEsi} (${r.groundTruthSeverity})
- **Predicted:** ESI ${r.predictedEsi} (${r.predictedSeverity}) — *${r.isExactMatch ? '✅ Exact Match' : r.isWithinOneLevel ? '⚠️ Within ±1 Level' : '❌ Mismatch'}*
- **Safety Screen Triggered:** ${r.safetyTriggered ? '🚨 YES (Deterministic Red Flag)' : 'Normal'}
- **Recommended Department:** ${r.recommendedDepartment ?? 'Emergency'}
- **Clinical Reasoning:** ${r.reasoning}
`
  )
  .join('\n')}
`;
}

main().catch((err) => {
  console.error('❌ Benchmark evaluation failed:', err);
  process.exit(1);
});
