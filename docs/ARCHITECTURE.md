# JeevanSetu — Architecture

## Principles

1. **Patient safety over AI.** A deterministic engine ([safety.engine.ts](../apps/server/src/modules/safety/safety.engine.ts)) runs before the model and its CRITICAL verdict cannot be downgraded — not by the AI, not by a doctor's override.
2. **Human in the loop.** No AI output reaches a patient without a doctor's APPROVE/MODIFY/OVERRIDE/REJECT decision. Overrides require a recorded justification.
3. **Explainable & auditable.** Every AI output carries reasoning and citations; every mutation is written to an immutable audit log with before/after state, actor, IP, and device.
4. **Clean architecture.** Each module is `engine` (pure logic) → `service` (orchestration + persistence) → `controller`/`routes` (HTTP). Pure logic has no I/O and is unit-tested.
5. **Graceful degradation.** Missing third-party credentials never crash the core. Each integration is feature-flagged in [env.ts](../apps/server/src/config/env.ts).

## Request lifecycle

```
HTTP → helmet → cors → requestContext (correlation id)
     → pino-http → json/raw body → clerk session → RBAC guard
     → controller → service → engine/Prisma/Neo4j/Pinecone
     → audit write → standard ApiResponse envelope
     → errorHandler (typed AppError → ApiError)
```

## Data model

PostgreSQL via Prisma. 25 core tables (see [schema.prisma](../apps/server/prisma/schema.prisma)). Every significant table carries:

- **Audit fields**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- **Soft delete**: `deletedAt` (queries filter `deletedAt: null`).
- **Indexes** on every foreign key and on the columns used by dashboards, routing, and audit queries.

Key relationships: `Patient 1—* Visit 1—1 TriageAssessment 1—1 {AIReasoning, DoctorReview, TriageDecision}`; `TriageAssessment *—* Guideline` via `GuidelineCitationRecord`; `Visit 1—1 HospitalRouting`, `Visit 1—1 Referral 1—* ReferralDocument`.

## The safety layer (Phase 5)

A pure function `runSafetyScreen(input, now)` evaluates an ordered set of red-flag rules over vitals and symptoms. If any fires, the patient is CRITICAL and an `EmergencyAlert` is raised. Examples encoded directly from the spec:

- `oxygen < 90` ⇒ CRITICAL
- `chest pain + oxygen < 92` ⇒ CRITICAL
- `unconscious` (flag, or GCS ≤ 8) ⇒ CRITICAL

plus cardiac arrest, stroke (FAST), major trauma, severe bleeding, shock, brady/tachycardia, hypertensive crisis, respiratory distress, hyper/hypothermia. The engine deliberately over-triages: a false positive is acceptable; a missed life-threat is not.

## AI triage (Phase 6) as a LangGraph

`retrieve` (RAG) → `assess` (LLM, structured output + retry) → `reconcile` (apply safety floor). Structured output is enforced with a Zod schema; up to 3 retries on validation failure; a deterministic, clearly-labelled fallback runs when Gemini is not configured. The `reconcile` node guarantees a safety-critical patient is never assigned below CRITICAL/ESI 1.

## Multi-agent pipeline (Phase 12)

Seven agents — Patient Intake, Triage, Guideline Retrieval, Risk Assessment, Routing, Referral Generation, Supervisor. The orchestrator records a supervised `AgentExecution` for each step. The **Supervisor** validates outputs **deterministically** (safety consistency, structural sanity, ranking order) because patient-safety gating must not itself depend on a probabilistic model. The pipeline intentionally stops at the human-in-the-loop boundary — it never auto-approves or auto-refers.

## Smart routing (Phase 10)

Candidate hospitals come from a Neo4j graph traversal (`HAS_DEPARTMENT`, `EMPLOYS`, `HAS_RESOURCE`), or an equivalent PostgreSQL query as fallback. A pure scorer combines five normalised factors — distance (Haversine), capacity, specialist match, equipment match, emergency tier — with severity-tuned weights, producing a ranked list with per-factor breakdowns and a natural-language explanation for each candidate.

## Realtime (Phase 14)

Domain services publish to a transport-agnostic event bus ([events.ts](../apps/server/src/realtime/events.ts)); the Socket.IO gateway fans events out to topic rooms (`metrics`, `emergency`, `notifications`, …). This decouples services from the transport and avoids circular dependencies.

## Security & compliance

- RBAC enforced server-side per route via the role→permission matrix.
- PHI is never logged; pino redacts auth headers and tokens.
- The HL7 FHIR R4 referral Bundle provides standards-based interoperability.
- Immutable audit trail satisfies the "who/when/before/after/IP/device" requirement.
