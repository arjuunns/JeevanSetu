# JeevanSetu

**AI-Assisted Clinical Triage, Referral and Hospital Routing System with Human-in-the-Loop Validation.**

JeevanSetu helps healthcare workers collect patient information, assess severity, retrieve official medical guidelines, generate referrals, and route patients to suitable hospitals — while **never making an autonomous medical decision**. A deterministic safety layer runs before any AI, and every AI recommendation requires a doctor's approval.

> ⚕️ **Patient safety over AI.** Deterministic rules always override the model. Every AI output is explainable and fully auditable.

---

## Monorepo layout

```
jeevansetu/
├── apps/
│   ├── server/        Express + TypeScript API (clean architecture, Prisma)
│   └── web/           Next.js 15 App Router + Tailwind + React Query + Recharts
├── packages/
│   ├── types/         Shared domain types, enums, Zod schemas (single source of truth)
│   ├── config/        Shared ESLint + tsconfig presets
│   └── ui/            Shared UI primitives
├── docker/            Dockerfiles + docker-compose (Postgres, Redis, Neo4j)
├── docs/              Architecture & API documentation
└── .github/workflows  CI pipeline
```

## Tech stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| Frontend     | Next.js 15, TypeScript, Tailwind, React Query, Recharts, Framer   |
| Backend      | Node.js, Express, TypeScript                                      |
| Primary DB   | PostgreSQL + Prisma ORM                                           |
| Cache / bus  | Redis                                                             |
| Vector DB    | Pinecone (RAG)                                                    |
| Graph DB     | Neo4j (smart routing)                                             |
| AI           | Gemini models, LangChain, LangGraph                            |
| Auth         | Clerk (RBAC)                                                      |
| Storage      | AWS S3 (with local fallback)                                      |
| Realtime     | Socket.IO                                                         |
| Deployment   | Docker, Railway, Vercel                                          |

## Architecture at a glance

```
Nurse intake ──► [Phase 5] Deterministic Safety Engine ──► (CRITICAL? raise EmergencyAlert)
                          │ (always runs first, always overrides AI)
                          ▼
              [Phase 6] AI Triage (LangGraph)
                 ├─ [Phase 7] Guideline Retrieval (Pinecone RAG) → citations
                 ├─ structured output + retry + validation
                 └─ Supervisor reconciles safety floor
                          ▼
              [Phase 8] Doctor Review (approve / modify / override / reject)
                          ▼
              [Phase 10] Smart Routing (Neo4j graph + scorer)
                          ▼
              [Phase 11] Referral (PDF + HL7 FHIR + QR)

Cross-cutting: [Phase 12] Multi-agent supervisor · [Phase 13] Notifications ·
               [Phase 14] Realtime dashboards · [Phase 15] Immutable audit trail
```

## Quick start (local)

Prerequisites: Node ≥ 20, pnpm ≥ 9, Docker.

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure (Postgres, Redis, Neo4j)
pnpm docker:up

# 3. Configure environment
cp .env.example .env          # fill in values; works with defaults for local

# 4. Generate Prisma client, run migrations, seed demo data
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Run everything (server on :4000, web on :3000)
pnpm dev
```

The platform runs **without** external AI/auth credentials in development:

- No `GEMINI_API_KEY` → triage uses a transparent deterministic fallback (clearly labelled).
- No `PINECONE_API_KEY` → RAG retrieval returns no citations (triage degrades gracefully).
- No `CLERK_SECRET_KEY` → auth is bypassed with a synthetic super-admin (dev only).
- No `NEO4J` → routing falls back to an equivalent PostgreSQL query.
- No AWS → generated documents are written to `apps/server/uploads/`.

## Roles & permissions (RBAC)

| Role           | Key permissions                                              |
| -------------- | ----------------------------------------------------------- |
| Nurse          | Register patients, record vitals & symptoms, view recs      |
| Doctor         | Review triage, approve/modify/override, generate referrals  |
| Hospital Admin | Manage hospitals, departments, specialists, bed capacity    |
| CMO            | View analytics, hospital load, referral trends, performance |
| Super Admin    | Manage users, hospitals, AI settings, audit logs            |

The matrix is defined once in [`packages/types/src/enums.ts`](packages/types/src/enums.ts) (`ROLE_PERMISSIONS`) and enforced by server guards and UI gating.

## Testing

```bash
pnpm test            # unit + integration (Vitest)
```

Deterministic, safety-critical logic ships with tests:

- [`safety.engine.test.ts`](apps/server/src/modules/safety/safety.engine.test.ts) — every spec rule (oxygen < 90, chest pain + oxygen < 92, unconscious, …).
- [`routing.scorer.test.ts`](apps/server/src/modules/routing/routing.scorer.test.ts) — ranking, factor bounds, severity weighting.

## API surface (`/api/v1`)

| Area          | Endpoint                                              |
| ------------- | ----------------------------------------------------- |
| Health        | `GET /health`, `GET /health/ready`                    |
| Users / RBAC  | `GET /users/me`, `POST /users`, `PATCH /users/:id/role` |
| Intake        | `POST /patients/intake`, `POST /patients/visits/:id/vitals` |
| Safety/Triage | `POST /triage/visits/:id/safety-screen`, `POST /triage/visits/:id/triage` |
| Guidelines    | `POST /guidelines/upload` (PDF), `GET /guidelines`    |
| Review        | `GET /reviews/queue`, `POST /reviews/visits/:id/review` |
| Hospitals     | `GET/POST /hospitals`, `PUT /hospitals/:id/capacity`  |
| Routing       | `POST /routing`                                       |
| Referrals     | `POST /referrals/visits/:id/generate`                 |
| Pipeline      | `POST /agents/visits/:id/pipeline`                    |
| Dashboard     | `GET /dashboard/metrics`                              |
| Audit         | `GET /audit`, `GET /audit/:entityType/:entityId`      |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design and [`docs/PHASES.md`](docs/PHASES.md) for the implementation status of each spec phase.

## Deployment

- **Server** → Railway (`docker/Dockerfile.server`, runs `prisma migrate deploy` on boot).
- **Web** → Vercel (Next.js) or Railway (`docker/Dockerfile.web`).
- **Databases** → managed Postgres, Redis, Neo4j Aura.

## License

UNLICENSED — capstone project.
