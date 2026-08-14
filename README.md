<div align="center">

<img src="https://img.shields.io/badge/%F0%9F%A9%BA-JeevanSetu-0f766e?style=for-the-badge&labelColor=134e4a" alt="JeevanSetu" height="42" />

# JeevanSetu

### 🚑 AI-Assisted Clinical Triage, Referral & Hospital Routing — with a Doctor Always in the Loop

*A deterministic safety floor. A multi-agent AI co-pilot. A graph-scored route to the right hospital bed.*

<br/>

[![Build](https://img.shields.io/badge/build-passing-22c55e?style=flat-square&logo=githubactions&logoColor=white)](#-cicd)
[![Version](https://img.shields.io/badge/version-1.0.0--beta-3b82f6?style=flat-square)](#-overview)
[![Deploy](https://img.shields.io/badge/deployment-live-16a34a?style=flat-square&logo=vercel&logoColor=white)](#-deployment)
[![FHIR](https://img.shields.io/badge/HL7%20FHIR-R4-e11d48?style=flat-square)](#-core-modules)
[![License](https://img.shields.io/badge/license-UNLICENSED-64748b?style=flat-square)](#-license)

<br/>

<img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Neo4j-4581C3?style=for-the-badge&logo=neo4j&logoColor=white" />
<img src="https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />

<br/><br/>

**[Live Demo](#-demo)** · **[Architecture](#-architecture)** · **[Quickstart](#-getting-started)** · **[API](#-api-documentation)** · **[Design Decisions](#-design-decisions)**

</div>

---

<div align="center">

### ⚡ The system in one picture

```mermaid
flowchart LR
    N["👩‍⚕️ Nurse<br/>intake + vitals"]:::actor
    S["🛡️ Safety Floor<br/>deterministic rules"]:::safety
    A["🤖 AI Triage<br/>RAG + LangGraph"]:::ai
    D["🩺 Doctor Review<br/>approve / override"]:::human
    R["🗺️ Smart Routing<br/>graph + scorer"]:::route
    F["📄 FHIR Referral<br/>PDF + QR"]:::out

    N --> S --> A --> D --> R --> F
    S -. "red flag → ESI 1 escalation" .-> D

    classDef actor fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#0b1b2b
    classDef safety fill:#fee2e2,stroke:#b91c1c,stroke-width:2px,color:#0b1b2b
    classDef ai fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef human fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
    classDef route fill:#ffedd5,stroke:#c2410c,stroke-width:2px,color:#0b1b2b
    classDef out fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
```

**No AI output reaches a patient without a doctor's signature.**

</div>

---

<details>
<summary><b>📑 Table of Contents</b> — click to expand</summary>

| | | |
|---|---|---|
| [Overview](#-overview) | [Problem Statement](#-problem-statement) | [Features](#-features) |
| [Demo](#-demo) | [Screenshots](#-screenshots) | [Architecture](#-architecture) |
| [Technology Stack](#-technology-stack) | [Project Structure](#-project-structure) | [Getting Started](#-getting-started) |
| [Configuration](#-configuration) | [API Documentation](#-api-documentation) | [Database Design](#-database-design) |
| [Core Modules](#-core-modules) | [Design Decisions](#-design-decisions) | [Challenges & Solutions](#-challenges--solutions) |
| [Trade-offs](#-trade-offs) | [Performance](#-performance-optimizations) | [Security](#-security) |
| [Scalability](#-scalability) | [Testing](#-testing) | [CI/CD](#-cicd) |
| [Deployment](#-deployment) | [Monitoring](#-monitoring--logging) | [Limitations](#-limitations) |
| [Future Improvements](#-future-improvements) | [Lessons Learned](#-lessons-learned) | [Contributing](#-contributing) |

</details>

---

# 🌍 Overview

**JeevanSetu** ("bridge of life") is an AI-assisted clinical triage, hospital routing, and referral system for emergency care networks. A frontline nurse captures vitals and symptoms; a deterministic safety engine screens for red flags; a RAG-backed multi-agent pipeline proposes a severity and ESI class with citations; a doctor approves, modifies, or overrides; only then does the system rank destination hospitals on live capacity and emit an HL7 FHIR referral.

> [!IMPORTANT]
> **Human-in-the-Loop by construction.** The system never makes an autonomous, final medical assessment. Routing, referral generation, and notifications are all gated behind a certified doctor's review.

<table>
<tr>
<th width="34%">👥 Who it's for</th>
<th width="33%">🔥 What it fixes</th>
<th width="33%">🧩 How it fixes it</th>
</tr>
<tr valign="top">
<td>

🧑‍⚕️ **Triage Nurses**<br/><sub>Fast intake, vitals, instant red-flag warnings</sub>

🩺 **Doctors**<br/><sub>Priority queue, guideline citations, one-click referral</sub>

🏥 **Hospital Admins**<br/><sub>Beds, ICU, departments, staffing</sub>

📊 **CMO / Health Authorities**<br/><sub>Regional analytics, transfer flow, capacity</sub>

🔐 **Super Admins**<br/><sub>Users, RBAC, audit trails</sub>

</td>
<td>

🚨 **ED overcrowding**<br/><sub>Trauma centres jam while community hospitals idle</sub>

🩻 **Routing failure**<br/><sub>Critical patients sent where the ventilator isn't</sub>

📚 **Guideline lookup lag**<br/><sub>WHO/ESI PDFs unusable under pressure</sub>

🎲 **AI hallucination risk**<br/><sub>Unbounded LLMs in a clinical loop</sub>

</td>
<td>

📐 **Live resource scorer**<br/><sub>5 weighted factors, severity-tuned</sub>

🛡️ **Deterministic gating**<br/><sub>Hard rules run *before* any LLM call</sub>

🔎 **RAG citations**<br/><sub>Exact snippet, section, and page number</sub>

✍️ **Doctor-in-the-Loop**<br/><sub>Downstream ops blocked until sign-off</sub>

</td>
</tr>
</table>

---

# 🎯 Problem Statement

```mermaid
mindmap
  root((🚑 Emergency Care Gaps))
    (🏥 Overcrowding)
      [Tertiary centres saturated]
      [Community beds idle]
      [Minor cases in critical bays]
    (🧭 Routing failure)
      [No ventilator on arrival]
      [No specialist on duty]
      [Golden hour lost in transfer]
    (📚 Cognitive overload)
      [400-page PDF handbooks]
      [Flowcharts split across pages]
      [No time to look anything up]
    (🤖 Unsafe AI)
      [Hallucinated severity]
      [No explainability]
      [No accountability trail]
```

| ❌ Real-world problem | ✅ JeevanSetu's answer |
|---|---|
| Patients misallocated across the network | **Live resource scorer** ranks hospitals by distance, capacity, equipment, specialists, tier |
| Severe patients routed to under-equipped sites | **Neo4j graph filter** — only candidates that actually satisfy the resource requirement survive |
| Guidelines too slow to consult mid-triage | **Pinecone RAG** returns the exact snippet + page, inline in the triage screen |
| LLMs unsafe as autonomous clinical deciders | **`safety.engine.ts`** runs first and its floor is absolute; supervisor reconciles AI output against it |

---

# ✨ Features

<table>
<tr><td width="50%" valign="top">

### 🏥 Clinical

- 📝 **Patient intake** — vitals, symptoms, allergies, guardian, history
- 🛡️ **Deterministic safety engine** — pediatric, trauma, cardiac, respiratory, neuro red flags
- 🤖 **AI triage (LangGraph)** — severity + ESI class as strict structured JSON
- 📚 **Medical PDF RAG** — multimodal Python ingestion → Pinecone citations
- 🗺️ **Smart routing** — Neo4j candidate filter + 5-factor weighted scorer
- 📄 **FHIR R4 referrals** — bundle + printable PDF + verification QR
- 📊 **Live dashboards** — Socket.IO metrics, alerts, load, referral tracking
- 🔒 **Immutable audit log** — actor, IP, user-agent, old/new state, timestamp

</td><td width="50%" valign="top">

### ⚙️ Technical

- 🔐 **Clerk auth** — modern session management, MFA-ready
- 👮 **Granular RBAC** — Nurse · Doctor · Admin · CMO · Super Admin
- ⚡ **Redis** — cache, queues, and pub/sub event bus
- 🕸️ **7-agent pipeline** — Intake, Safety, Triage, RAG, Risk, Routing, Supervisor
- ☁️ **S3-compatible uploads** — local filesystem fallback for dev
- 📣 **Multi-channel alerts** — Resend email · Twilio SMS · in-app toasts
- 🧪 **Vitest** — unit coverage on the safety engine and routing scorer
- 🧰 **Graceful degradation** — every external dependency has a fallback path

</td></tr>
</table>

---

# 🎬 Demo

<div align="center">

| 🌐 Live App | 🎥 Walkthrough | 📘 API Docs |
|:---:|:---:|:---:|
| [![Live](https://img.shields.io/badge/Open%20Staging%20App-16a34a?style=for-the-badge&logo=vercel&logoColor=white)](https://jeevansetu-staging.vercel.app) | [![Video](https://img.shields.io/badge/Watch%20Demo-e11d48?style=for-the-badge&logo=youtube&logoColor=white)](https://jeevansetu-staging.vercel.app/docs/demo.mp4) | [![Swagger](https://img.shields.io/badge/Swagger%20UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:4000/api/v1/docs) |

</div>

---

# 🖼️ Screenshots

<table>
<tr>
<td width="50%" valign="top">

### 1️⃣ Nurse Intake
```
┌──────────────────────────────────────┐
│  🧑‍⚕️  NEW PATIENT INTAKE      Step 2/4 │
├──────────────────────────────────────┤
│  Name  ▸ Asha Kulkarni     Age ▸ 62   │
│  ────────────────────────────────────│
│  SpO₂    ▓▓▓▓▓▓▓░░░  87%   🔴 CRITICAL│
│  HR      ▓▓▓▓▓▓▓▓░░  128               │
│  BP      86 / 54           🟠 LOW      │
│  GCS     ▓▓▓░░░░░░░  8     🔴 CRITICAL│
│  ────────────────────────────────────│
│  🛡️ SAFETY SCREEN: 2 RED FLAGS         │
│     → auto-escalated to ESI 1          │
└──────────────────────────────────────┘
```
<sub>Vitals capture with live threshold feedback and an instant deterministic safety verdict.</sub>

</td>
<td width="50%" valign="top">

### 2️⃣ Doctor Review + RAG Citations
```
┌──────────────────────────────────────┐
│  🩺 REVIEW QUEUE            3 waiting │
├──────────────────────────────────────┤
│  AI SEVERITY  ▸ CRITICAL   ESI 1      │
│  CONFIDENCE   ▓▓▓▓▓▓▓▓▓░  0.91        │
│  ────────────────────────────────────│
│  📚 CITATIONS                          │
│   • ESI Handbook  p.42  §3.1  ▓▓▓ .88 │
│   • WHO ETAT      p.17  §2.4  ▓▓░ .74 │
│  ────────────────────────────────────│
│  [ ✅ APPROVE ] [ ✏️ MODIFY ] [ ⛔ OVERRIDE ]│
└──────────────────────────────────────┘
```
<sub>Every AI claim carries a source, section, page, and similarity score before a doctor signs.</sub>

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 3️⃣ Routing & Scoring
```
┌──────────────────────────────────────┐
│  🗺️ RECOMMENDED DESTINATIONS          │
├──────────────────────────────────────┤
│ 🥇 City Trauma Ctr    score ▓▓▓▓▓ .91 │
│    6.2 km · 14 ICU · 🫁 vent · 🫀 cath│
│ 🥈 St. Mary General   score ▓▓▓░░ .67 │
│    3.1 km · 2 ICU  · 🫁 vent          │
│ 🥉 Rural CHC          score ▓▓░░░ .38 │
│    1.8 km · 0 ICU  · no specialist    │
│  ────────────────────────────────────│
│  "Nearest is not best: CHC lacks ICU" │
└──────────────────────────────────────┘
```
<sub>Ranked candidates with a human-readable reason for the ordering.</sub>

</td>
<td width="50%" valign="top">

### 4️⃣ CMO Regional Analytics
```
┌──────────────────────────────────────┐
│  📊 REGIONAL COMMAND         ● LIVE   │
├──────────────────────────────────────┤
│  ESI 1 ▓▓░░░░░░░░  12   Transfers  47 │
│  ESI 2 ▓▓▓▓░░░░░░  31   Avg triage 42s│
│  ESI 3 ▓▓▓▓▓▓▓░░░  88   Overrides  6% │
│  ────────────────────────────────────│
│  BED LOAD   City ██████████ 96% 🔴    │
│             Mary ██████░░░░ 61% 🟡    │
│             CHC  ██░░░░░░░░ 18% 🟢    │
└──────────────────────────────────────┘
```
<sub>Socket.IO-driven regional heatmap, transfer flow, and triage accuracy trends.</sub>

</td>
</tr>
</table>

---

# 🏛️ Architecture

## System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["🖥️  CLIENT LAYER"]
        direction LR
        WEB["Next.js 15 App Router<br/><sub>React Query · Tailwind · Recharts</sub>"]
        WS["Socket.IO Client<br/><sub>live metrics & alerts</sub>"]
    end

    subgraph EDGE["🚪  EDGE / GATEWAY"]
        direction LR
        CLERK["🔐 Clerk<br/><sub>session + identity</sub>"]
        RBAC["👮 RBAC Guard<br/><sub>role & permission checks</sub>"]
        ZOD["✅ Zod Validation<br/><sub>shared schemas</sub>"]
    end

    subgraph API["⚙️  EXPRESS API — apps/server"]
        direction LR
        SAFE["🛡️ Safety Engine<br/><sub>deterministic, pre-AI</sub>"]
        TRI["🤖 Triage Engine<br/><sub>Gemini structured output</sub>"]
        RAGM["📚 RAG Service<br/><sub>retrieve + cite</sub>"]
        ROUTE["🗺️ Routing Service<br/><sub>filter + score</sub>"]
        REF["📄 Referral Service<br/><sub>FHIR · PDF · QR</sub>"]
        AUD["📜 Audit Service<br/><sub>immutable trail</sub>"]
    end

    subgraph AGENTS["🕸️  LANGGRAPH ORCHESTRATOR"]
        direction LR
        SUP["👁️ Supervisor<br/><sub>reconciles AI vs safety floor</sub>"]
    end

    subgraph DATA["🗄️  DATA LAYER"]
        direction LR
        PG[("🐘 PostgreSQL<br/><sub>transactional truth</sub>")]
        NEO[("🕸️ Neo4j<br/><sub>hospital resource graph</sub>")]
        PINE[("🌲 Pinecone<br/><sub>guideline vectors</sub>")]
        RDS[("⚡ Redis<br/><sub>cache · pub/sub</sub>")]
    end

    subgraph EXT["🌐  EXTERNAL SERVICES"]
        direction LR
        GEM["✨ Gemini"]
        S3["☁️ S3 / Local FS"]
        NOTIF["📣 Resend · Twilio"]
    end

    WEB -->|HTTPS REST| EDGE
    WS <-->|WebSocket| API
    EDGE --> API
    CLERK -.-> RBAC

    SAFE ==>|"floor first"| TRI
    TRI --> RAGM
    TRI --> AGENTS
    AGENTS ==>|"approved severity"| ROUTE
    ROUTE --> REF
    API --> AUD

    API -->|Prisma| PG
    ROUTE -->|Cypher| NEO
    RAGM -->|vector query| PINE
    API -->|cache / events| RDS
    TRI --> GEM
    REF --> S3
    API --> NOTIF

    classDef client fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#0b1b2b
    classDef edge fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#0b1b2b
    classDef api fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef agents fill:#fae8ff,stroke:#a21caf,stroke-width:2px,color:#0b1b2b
    classDef data fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
    classDef ext fill:#ffe4e6,stroke:#be123c,stroke-width:2px,color:#0b1b2b

    class WEB,WS client
    class CLERK,RBAC,ZOD edge
    class SAFE,TRI,RAGM,ROUTE,REF,AUD api
    class SUP agents
    class PG,NEO,PINE,RDS data
    class GEM,S3,NOTIF ext
```

<details>
<summary><b>🔄 Request Flow — a triage call, end to end</b></summary>

```mermaid
sequenceDiagram
    autonumber
    actor Nurse as 🧑‍⚕️ Nurse
    participant Web as 🖥️ Next.js
    participant API as ⚙️ Express
    participant Safe as 🛡️ Safety Engine
    participant Pine as 🌲 Pinecone
    participant Gem as ✨ Gemini
    participant Sup as 👁️ Supervisor
    participant PG as 🐘 Postgres
    participant IO as 📡 Socket.IO

    Nurse->>Web: Submit vitals + symptoms
    Web->>API: POST /triage/visits/:id/triage
    API->>API: Clerk session + RBAC + Zod

    rect rgb(254, 226, 226)
    Note over Safe: DETERMINISTIC FLOOR — runs before any LLM
    API->>Safe: screenVisit(visitId)
    Safe-->>API: red flags + isCritical
    end

    rect rgb(237, 233, 254)
    Note over Pine,Gem: AI ADVISORY LAYER
    API->>Pine: embed(symptoms) → top-k guideline chunks
    Pine-->>API: snippets + page + section + score
    API->>Gem: structured triage prompt + citations
    Gem-->>API: {severity, esiLevel, confidence, rationale}
    end

    rect rgb(220, 252, 231)
    Note over Sup: RECONCILIATION — floor wins ties
    API->>Sup: superviseTriage(aiResult, safetyResult)
    Sup-->>API: approved / escalated verdict
    end

    API->>PG: TX — assessment + citations + status=UNDER_REVIEW
    API->>PG: TX — audit log (VISIT_TRIAGED)
    API->>IO: broadcast metrics + emergency alert
    IO-->>Web: 📡 live dashboard update
    API-->>Web: 201 Created
    Web-->>Nurse: Verdict + citations rendered
```

</details>

<details>
<summary><b>🔁 Visit Lifecycle — state machine</b></summary>

```mermaid
stateDiagram-v2
    direction LR
    [*] --> REGISTERED: 🧑‍⚕️ intake
    REGISTERED --> TRIAGED: 🛡️ safety + 🤖 AI triage
    TRIAGED --> UNDER_REVIEW: queued for doctor
    UNDER_REVIEW --> APPROVED: ✅ doctor approves
    UNDER_REVIEW --> TRIAGED: ✏️ modified / ⛔ overridden
    APPROVED --> REFERRED: 🗺️ routed + 📄 FHIR referral
    REFERRED --> [*]

    note right of UNDER_REVIEW
        🚧 Hard gate.
        No routing, referral, or
        notification happens
        before this transition.
    end note
```

</details>

<details>
<summary><b>🧩 Monorepo component map</b></summary>

```mermaid
flowchart LR
    subgraph W["apps/web"]
        WA["App Router pages"]
        WC["Components + hooks"]
    end
    subgraph T["packages/types"]
        TT["Domain types + Zod schemas<br/><sub>single source of truth</sub>"]
    end
    subgraph S["apps/server"]
        SM["modules/*"]
        SL["lib/* clients"]
    end
    subgraph P["medical-pdf"]
        PI["Python ingestion<br/><sub>parse · chunk · embed</sub>"]
    end

    WA --> TT
    WC --> TT
    SM --> TT
    SM --> SL
    PI -->|upserts vectors| SL

    classDef box fill:#f1f5f9,stroke:#475569,stroke-width:2px,color:#0b1b2b
    class WA,WC,TT,SM,SL,PI box
```

</details>

---

# 🧰 Technology Stack

<div align="center">

```mermaid
flowchart TB
    subgraph FE["🎨 FRONTEND"]
        F1["Next.js 15"]:::t
        F2["TypeScript"]:::t
        F3["Tailwind CSS"]:::t
        F4["React Query"]:::t
        F5["Socket.IO Client"]:::t
        F6["Recharts"]:::t
        F7["Framer Motion"]:::t
    end
    subgraph BE["⚙️ BACKEND"]
        B1["Node + Express"]:::t
        B2["Prisma ORM"]:::t
        B3["LangChain / LangGraph"]:::t
        B4["Socket.IO Server"]:::t
        B5["Pino Logger"]:::t
        B6["Zod"]:::t
    end
    subgraph DB["🗄️ DATA"]
        D1["PostgreSQL"]:::t
        D2["Neo4j"]:::t
        D3["Pinecone"]:::t
        D4["Redis"]:::t
    end
    subgraph OPS["🚀 INFRA"]
        O1["Docker Compose"]:::t
        O2["GitHub Actions"]:::t
        O3["Terraform"]:::t
        O4["AWS S3"]:::t
        O5["Clerk"]:::t
        O6["Resend + Twilio"]:::t
    end
    FE --> BE --> DB
    BE --> OPS
    classDef t fill:#e2e8f0,stroke:#334155,stroke-width:1.5px,color:#0b1b2b
```

</div>

<table>
<tr><td width="50%" valign="top">

**🎨 Frontend**

| Tech | Purpose |
|---|---|
| **Next.js 15** | App Router, Server Components |
| **TypeScript** | Type-safe end to end |
| **Tailwind CSS** | Styling and layout |
| **React Query** | Server-state sync |
| **Socket.IO Client** | Live dashboards |
| **Recharts** | Analytics charts |
| **Framer Motion** | Transitions |

</td><td width="50%" valign="top">

**⚙️ Backend**

| Tech | Purpose |
|---|---|
| **Node / Express** | API runtime + routing |
| **Prisma** | Postgres ORM + migrations |
| **LangChain / LangGraph** | Multi-agent orchestration |
| **Socket.IO** | Real-time broadcast |
| **Pino** | Structured logging |
| **Zod** | Runtime validation |

</td></tr>
<tr><td valign="top">

**🗄️ Data**

| Store | Role |
|---|---|
| 🐘 **PostgreSQL** | Users, patients, visits, reviews, audits |
| 🕸️ **Neo4j** | Hospital resources, departments, routing |
| 🌲 **Pinecone** | Guideline embeddings for RAG |
| ⚡ **Redis** | Cache, queues, pub/sub |

</td><td valign="top">

**🚀 Infrastructure**

| Tool | Role |
|---|---|
| 🐳 **Docker / Compose** | Local + containerised deploys |
| ☁️ **AWS S3** | Referral PDFs, guideline docs |
| 🔐 **Clerk** | Auth + RBAC provisioning |
| 📧 **Resend** | Transactional email |
| 📱 **Twilio** | Emergency SMS |
| 🤖 **GitHub Actions** | CI/CD |

</td></tr>
</table>

---

# 📁 Project Structure

```text
jeevansetu/
│
├── 📱 apps/
│   ├── server/                      # Express API
│   │   ├── prisma/                  # Schema · migrations · seeds
│   │   └── src/
│   │       ├── config/              # env validation, Pino logger
│   │       ├── lib/                 # ai · pinecone · prisma · storage clients
│   │       ├── middleware/          # auth · RBAC · validation · errors
│   │       ├── modules/             # ── domain features ──────────────
│   │       │   ├── 🛡️  safety/       #   deterministic red-flag engine
│   │       │   ├── 🤖 triage/       #   Gemini triage + prompts
│   │       │   ├── 🕸️  agents/       #   LangGraph orchestrator + supervisor
│   │       │   ├── 📚 rag/          #   chunking · pdf-extract · retrieval
│   │       │   ├── 🗺️  routing/      #   neo4j · geo · scorer
│   │       │   ├── 📄 referrals/    #   fhir · pdf · qr
│   │       │   ├── 🩺 review/       #   doctor queue + decisions
│   │       │   ├── 📊 dashboard/    #   live metrics
│   │       │   └── 📜 audit/        #   immutable trail
│   │       ├── realtime/            # Socket.IO server + events
│   │       └── app.ts               # Express bootstrap
│   │
│   └── web/                         # Next.js 15 client
│       └── src/
│           ├── app/(dashboard)/     # intake · review · hospitals · analytics
│           ├── components/          # StatCard · SeverityBadge · EmergencyToast
│           ├── context/             # Language provider
│           └── hooks/               # useEmergencySocket, API hooks
│
├── 📦 packages/
│   ├── types/                       # shared domain types + Zod schemas
│   ├── config/                      # ESLint + tsconfig presets
│   └── ui/                          # shared UI primitives
│
├── 🐍 medical-pdf/ingestion/        # PDF → chunks → embeddings → Pinecone
├── 🐳 docker/                       # Dockerfiles + compose
├── 🏗️  terraform/                    # cloud infrastructure
└── 📚 docs/                         # ARCHITECTURE.md · PHASES.md
```

---

# 🚀 Getting Started

### 📋 Prerequisites

<div align="center">

![Node](https://img.shields.io/badge/Node.js-≥20-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-≥9-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-any-F05032?style=flat-square&logo=git&logoColor=white)

</div>

### ⚡ Five steps to a running stack

```mermaid
flowchart LR
    A["1️⃣ clone"]:::s --> B["2️⃣ pnpm install"]:::s --> C["3️⃣ docker:up<br/><sub>PG · Redis · Neo4j</sub>"]:::s --> D["4️⃣ migrate + seed"]:::s --> E["5️⃣ pnpm dev"]:::go
    classDef s fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef go fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
```

```bash
# 1 — clone
git clone https://github.com/your-repo/JeevanSetu.git && cd JeevanSetu

# 2 — install workspace deps
pnpm install

# 3 — boot local infra (Postgres, Redis, Neo4j)
pnpm docker:up

# 4 — prepare the database
pnpm db:generate && pnpm db:migrate && pnpm db:seed

# 5 — run everything
pnpm dev
```

<div align="center">

| Service | URL |
|---|---|
| 🖥️ Web | `http://localhost:3000` |
| ⚙️ API | `http://localhost:4000` |
| 🕸️ Neo4j Browser | `http://localhost:7474` |

</div>

---

# ⚙️ Configuration

```bash
cp .env.example .env
```

> [!TIP]
> Almost every external dependency is **optional in development** — the server degrades gracefully rather than failing to boot.

| Variable | Description | Required | Fallback behaviour |
|---|---|:---:|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | — (hard requirement) |
| `REDIS_URL` | Redis server URL | ⬜ | In-process cache, no cross-instance pub/sub |
| `GEMINI_API_KEY` | Google Gemini key | ⬜ | 🔁 Deterministic rule-based assessor |
| `PINECONE_API_KEY` | Pinecone key | ⬜ | 🔁 RAG citations disabled |
| `NEO4J_URI` | Neo4j bolt endpoint | ⬜ | 🔁 Postgres candidate query |
| `CLERK_SECRET_KEY` | Clerk backend key | ⬜ | 🔁 Mock dev user, auth bypassed |

**Config files worth knowing:**

| File | Role |
|---|---|
| `pnpm-workspace.yaml` | Monorepo workspace wiring |
| `turbo.json` | Build/task caching graph |
| `prisma/schema.prisma` | Schema, indexes, extensions |
| `apps/server/src/config/env.ts` | Boot-time env validation |

---

# 🔌 API Documentation

<div align="center">

```mermaid
flowchart LR
    H["🩺 /health"]:::h
    P["🧑‍⚕️ /patients"]:::p
    T["🛡️🤖 /triage"]:::t
    G["📚 /guidelines"]:::g
    R["✅ /reviews"]:::r
    RO["🗺️ /routing"]:::ro
    RF["📄 /referrals"]:::rf
    P --> T --> R --> RO --> RF
    G -.->|cited by| T
    classDef h fill:#f1f5f9,stroke:#475569,color:#0b1b2b
    classDef p fill:#dbeafe,stroke:#1d4ed8,color:#0b1b2b
    classDef t fill:#fee2e2,stroke:#b91c1c,color:#0b1b2b
    classDef g fill:#ede9fe,stroke:#6d28d9,color:#0b1b2b
    classDef r fill:#dcfce7,stroke:#15803d,color:#0b1b2b
    classDef ro fill:#ffedd5,stroke:#c2410c,color:#0b1b2b
    classDef rf fill:#e0f2fe,stroke:#0369a1,color:#0b1b2b
```

</div>

<details open>
<summary><b>🩺 Health & System</b></summary>

| Method | Endpoint | Description |
|:---:|---|---|
| ![GET](https://img.shields.io/badge/GET-22c55e?style=flat-square) | `/health` | Liveness probe |
| ![GET](https://img.shields.io/badge/GET-22c55e?style=flat-square) | `/health/ready` | Readiness — Postgres, Redis, Neo4j |

</details>

<details open>
<summary><b>🧑‍⚕️ Patients & Intake</b></summary>

| Method | Endpoint | Description |
|:---:|---|---|
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/patients/intake` | Register patient + open a visit |
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/patients/visits/:id/vitals` | Record vital signs |

</details>

<details open>
<summary><b>🛡️ Triage & Guidelines</b></summary>

| Method | Endpoint | Description |
|:---:|---|---|
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/triage/visits/:id/safety-screen` | Deterministic safety floor |
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/triage/visits/:id/triage` | Multi-agent AI triage |
| ![GET](https://img.shields.io/badge/GET-22c55e?style=flat-square) | `/api/v1/guidelines` | List ingested guidelines |
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/guidelines/upload` | Ingest a new guideline PDF |

</details>

<details open>
<summary><b>✅ Review, Routing & Referrals</b></summary>

| Method | Endpoint | Description |
|:---:|---|---|
| ![GET](https://img.shields.io/badge/GET-22c55e?style=flat-square) | `/api/v1/reviews/queue` | Cases awaiting doctor approval |
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/reviews/visits/:id/review` | Approve · modify · override |
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/routing` | Ranked hospital destinations |
| ![POST](https://img.shields.io/badge/POST-3b82f6?style=flat-square) | `/api/v1/referrals/visits/:id/generate` | FHIR bundle + PDF + QR |

</details>

---

# 🗃️ Database Design

```mermaid
erDiagram
    USER ||--o{ PATIENT : registers
    USER ||--o{ DOCTOR_REVIEW : performs
    USER ||--o{ AUDIT_LOG : "acts in"
    USER }o--|| HOSPITAL : "belongs to"

    PATIENT ||--o{ VISIT : has
    VISIT ||--o{ VITALS : records
    VISIT ||--o{ SYMPTOM : reports
    VISIT ||--|| TRIAGE_ASSESSMENT : produces
    VISIT ||--o{ DOCTOR_REVIEW : "reviewed by"
    VISIT ||--o| HOSPITAL_ROUTING : routes
    VISIT ||--o| REFERRAL : generates
    VISIT ||--o{ AGENT_EXECUTION : traces

    TRIAGE_ASSESSMENT ||--o{ GUIDELINE_CITATION : cites
    GUIDELINE ||--o{ GUIDELINE_CITATION : "sourced from"
    HOSPITAL ||--o{ HOSPITAL_ROUTING : "candidate for"
    REFERRAL ||--o{ REFERRAL_DOCUMENT : attaches

    USER {
        string id PK
        string clerkUserId UK
        string email
        enum   role "NURSE|DOCTOR|ADMIN|CMO|SUPER_ADMIN"
        string hospitalId FK
        bool   isActive
    }
    PATIENT {
        string id PK
        string mrn UK
        string name
        int    age
        enum   gender
        string bloodGroup
        json   allergies
    }
    VISIT {
        string   id PK
        string   patientId FK
        enum     status "REGISTERED|TRIAGED|UNDER_REVIEW|APPROVED|REFERRED"
        datetime arrivalAt
    }
    TRIAGE_ASSESSMENT {
        string id PK
        enum   severity "LOW|MODERATE|HIGH|CRITICAL"
        int    esiLevel "1..5"
        float  confidence
        string rationale
    }
    AUDIT_LOG {
        string id PK
        string action
        string entityType
        string actorId FK
        json   oldState
        json   newState
        string ipAddress
    }
```

<details>
<summary><b>📋 Core table notes</b></summary>

| Table | Purpose | Key columns |
|---|---|---|
| **`users`** | Identity mirrored from Clerk, plus app role | `clerkUserId`, `role`, `hospitalId`, `isActive` |
| **`patients`** | Demographics + static clinical facts | `mrn`, `name`, `age`, `bloodGroup`, `allergies` |
| **`visits`** | One emergency check-in; the spine of the workflow | `status`, `arrivalAt`, `patientId` |
| **`triage_assessments`** | AI output + supervisor verdict | `severity`, `esiLevel`, `confidence`, `rationale` |
| **`audit_logs`** | Append-only history | `action`, `oldState`, `newState`, `ipAddress`, `userAgent` |

</details>

---

# 🧠 Core Modules

## 🛡️ 1. Safety Layer — `modules/safety`

Deterministic rules evaluated **before any model call**. If a rule fires, the case is escalated regardless of what the LLM later says.

```mermaid
flowchart TD
    V["📥 Vitals + symptoms"]:::in --> C{"Any red flag rule fires?"}:::dec

    C -->|"🫁 SpO₂ &lt; 90%"| CRIT
    C -->|"🧠 GCS ≤ 8 / unconscious"| CRIT
    C -->|"🫀 No pulse"| CRIT
    C -->|"🩸 Systolic BP out of bounds"| CRIT
    C -->|"🌡️ Temp ≥ 41°C or ≤ 32°C"| CRIT
    C -->|"💔 Chest pain + SpO₂ &lt; 92%"| CRIT
    C -->|"no rule fires"| OK["✅ Pass to AI triage"]:::ok

    CRIT["🚨 CRITICAL — escalate to ESI 1<br/><sub>emit alert · notify · lock the floor</sub>"]:::crit
    CRIT --> FLOOR["🔒 Safety floor recorded<br/><sub>AI may raise severity, never lower it</sub>"]:::floor

    classDef in fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef dec fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#0b1b2b
    classDef crit fill:#fecaca,stroke:#b91c1c,stroke-width:3px,color:#0b1b2b
    classDef floor fill:#fee2e2,stroke:#7f1d1d,stroke-width:2px,color:#0b1b2b
    classDef ok fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
```

📄 `apps/server/src/modules/safety/safety.engine.ts` · rules carry a `rationale` and machine-readable `evidence` payload for the audit trail.

---

## 🤖 2. AI Triage Engine — `modules/triage`

```mermaid
flowchart LR
    A["📥 Visit context"]:::s --> B["🔎 Retrieve guidelines<br/><sub>Pinecone top-k</sub>"]:::s
    B --> C["✨ Gemini structured call<br/><sub>strict JSON schema</sub>"]:::ai
    C --> D["👁️ Supervisor<br/><sub>reconcile vs safety floor</sub>"]:::sup
    D --> E{"Verdict"}:::dec
    E -->|approved| F["💾 Persist + cite"]:::ok
    E -->|conflict| G["⬆️ Escalate to floor severity"]:::warn
    classDef s fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef ai fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef sup fill:#fae8ff,stroke:#a21caf,stroke-width:2px,color:#0b1b2b
    classDef dec fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#0b1b2b
    classDef ok fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
    classDef warn fill:#ffedd5,stroke:#c2410c,stroke-width:2px,color:#0b1b2b
```

📄 `triage.engine.ts` · `triage.prompts.ts` · `agents/supervisor.ts`

---

## 🗺️ 3. Hospital Routing — `modules/routing`

Two stages: a **graph filter** that removes hospitals which cannot serve the case, then a **pure, deterministic scorer** over five normalised `[0,1]` factors.

```mermaid
flowchart TB
    R["📋 Requirement<br/><sub>severity · specialist · equipment</sub>"]:::in
    R --> N["🕸️ Neo4j traversal<br/><sub>Postgres fallback</sub>"]:::gdb
    N --> CAND["🏥 Candidate hospitals"]:::cand
    CAND --> SC["🧮 scoreCandidate()"]:::score

    SC --> F1["📍 distance<br/><sub>1 / (1 + km/12)</sub>"]:::f
    SC --> F2["🛏️ capacity<br/><sub>beds / reference</sub>"]:::f
    SC --> F3["👨‍⚕️ specialist match<br/><sub>0 or 1</sub>"]:::f
    SC --> F4["🫁 equipment match<br/><sub>0 or 1</sub>"]:::f
    SC --> F5["🚨 emergency tier<br/><sub>tier / 4</sub>"]:::f

    F1 & F2 & F3 & F4 & F5 --> W["⚖️ Severity-tuned weights"]:::w
    W --> OUT["🥇 Ranked list + route reasoning"]:::out

    classDef in fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef gdb fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#0b1b2b
    classDef cand fill:#f1f5f9,stroke:#475569,stroke-width:2px,color:#0b1b2b
    classDef score fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef f fill:#fef9c3,stroke:#a16207,stroke-width:1.5px,color:#0b1b2b
    classDef w fill:#ffedd5,stroke:#c2410c,stroke-width:2px,color:#0b1b2b
    classDef out fill:#dcfce7,stroke:#15803d,stroke-width:3px,color:#0b1b2b
```

### ⚖️ Weights shift with severity

For **CRITICAL** cases, proximity and emergency capability dominate — the golden hour beats a perfect specialist match:

<table>
<tr><td width="50%">

```mermaid
pie showData
    title 🔴 CRITICAL weighting
    "📍 distance" : 35
    "🚨 emergency tier" : 20
    "🛏️ capacity" : 15
    "👨‍⚕️ specialist" : 15
    "🫁 equipment" : 15
```

</td><td width="50%">

```mermaid
pie showData
    title 🟢 LOW / MODERATE weighting
    "👨‍⚕️ specialist" : 30
    "🛏️ capacity" : 25
    "📍 distance" : 25
    "🫁 equipment" : 10
    "🚨 emergency tier" : 5
```

</td></tr>
</table>

| Severity | 📍 distance | 🛏️ capacity | 👨‍⚕️ specialist | 🫁 equipment | 🚨 tier |
|---|:---:|:---:|:---:|:---:|:---:|
| 🔴 **CRITICAL** | **0.35** | 0.15 | 0.15 | 0.15 | **0.20** |
| 🟠 **HIGH** | 0.30 | 0.20 | **0.25** | 0.15 | 0.10 |
| 🟢 **LOW / MODERATE** | 0.25 | 0.25 | **0.30** | 0.10 | 0.05 |

📄 `routing.scorer.ts` (pure + unit-tested) · `neo4j.ts` · `geo.ts`

---

## 📄 4. Referrals — `modules/referrals`

```mermaid
flowchart LR
    A["✅ Approved visit"]:::in --> B["🧬 FHIR R4 bundle"]:::f
    B --> C["📄 PDF render"]:::f
    C --> D["🔗 Verification QR"]:::f
    D --> E["☁️ S3 / local storage"]:::st
    E --> F["📣 Email + SMS + toast"]:::n
    classDef in fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
    classDef f fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef st fill:#f1f5f9,stroke:#475569,stroke-width:2px,color:#0b1b2b
    classDef n fill:#ffe4e6,stroke:#be123c,stroke-width:2px,color:#0b1b2b
```

---

# 🧭 Design Decisions

<table>
<tr><th width="26%">Decision</th><th width="37%">Why</th><th width="37%">Consequence</th></tr>
<tr valign="top">
<td>🛡️ <b>Deterministic safety gating</b></td>
<td>LLMs cannot guarantee bounds on life-critical thresholds.</td>
<td>Hard-coded TS rules run <i>before</i> the model. AI is advisory; the floor is absolute.</td>
</tr>
<tr valign="top">
<td>🕸️ <b>Neo4j for routing</b></td>
<td>"Cardiologist + ICU bed + ventilator, within range" is a graph question, not a join.</td>
<td>Candidate filtering stays fast as the resource model grows; Postgres remains the fallback.</td>
</tr>
<tr valign="top">
<td>🧾 <b>Zod in <code>packages/types</code></b></td>
<td>Form validation and API validation drifting apart is a class of bug, not one bug.</td>
<td>One schema, imported by both apps. Change it once.</td>
</tr>
<tr valign="top">
<td>🧮 <b>Pure scorer function</b></td>
<td>Ranking logic must be explainable and testable in isolation.</td>
<td><code>scoreCandidate()</code> has no I/O — unit tests cover the weighting directly.</td>
</tr>
</table>

---

# 🧗 Challenges & Solutions

<details open>
<summary><b>⚠️ Challenge — External model quotas and availability</b></summary>

**Problem:** missing API keys or Gemini free-tier rate limits stalled local development and CI.

**Solution:** feature-flagged resilience. Missing key or failed call → the server degrades to a local rule-based assessor and labels the output `[DETERMINISTIC FALLBACK]`, so nobody mistakes it for a model verdict.

```mermaid
flowchart LR
    A["triage request"]:::i --> B{"key present<br/>and call OK?"}:::d
    B -->|yes| C["✨ Gemini structured output"]:::ok
    B -->|no| D["🔁 rule-based assessor<br/><sub>tagged DETERMINISTIC FALLBACK</sub>"]:::fb
    classDef i fill:#e0f2fe,stroke:#0369a1,color:#0b1b2b
    classDef d fill:#fef9c3,stroke:#a16207,color:#0b1b2b
    classDef ok fill:#dcfce7,stroke:#15803d,color:#0b1b2b
    classDef fb fill:#ffedd5,stroke:#c2410c,color:#0b1b2b
```

</details>

<details open>
<summary><b>⚠️ Challenge — RAG retrieval accuracy on clinical PDFs</b></summary>

**Problem:** naive text chunking cut flowcharts and triage tables in half across page boundaries, producing citations that were technically relevant and clinically useless.

**Solution:** a hybrid Python pipeline that extracts tables structurally and converts flowchart images via Gemini Vision, storing each as an **atomic, undivided chunk**.

```mermaid
flowchart LR
    P["📕 Clinical PDF"]:::i --> S{"page type?"}:::d
    S -->|prose| T["✂️ semantic chunker"]:::c
    S -->|table| TB["📊 table converter<br/><sub>atomic chunk</sub>"]:::c
    S -->|flowchart| FC["🖼️ Gemini Vision<br/><sub>atomic chunk</sub>"]:::c
    T & TB & FC --> E["🔢 embedder"]:::e --> PI["🌲 Pinecone upsert"]:::o
    classDef i fill:#e0f2fe,stroke:#0369a1,color:#0b1b2b
    classDef d fill:#fef9c3,stroke:#a16207,color:#0b1b2b
    classDef c fill:#ede9fe,stroke:#6d28d9,color:#0b1b2b
    classDef e fill:#fae8ff,stroke:#a21caf,color:#0b1b2b
    classDef o fill:#dcfce7,stroke:#15803d,color:#0b1b2b
```

</details>

---

# ⚖️ Trade-offs

### 🔐 Clerk (managed auth) vs self-hosted JWT

| | |
|---|---|
| **Chosen** | ✅ Clerk |
| **Pros** | Instant integration · built-in MFA · session logging · RBAC role management out of the box |
| **Cons** | External network dependency · subscription pricing ceiling |
| **Mitigation** | Bypassed in dev via a local mock user, so development never blocks on a third party |

---

# ⚡ Performance Optimizations

| | Optimization | Effect |
|:---:|---|---|
| 🗄️ | **Redis query caching** on hospital bed capacity with write-through invalidation | Removes the hottest read from the routing path |
| 🪆 | **Matryoshka embedding truncation** — 3072 → 1024 dimensions before indexing | Smaller payloads, lower Pinecone query latency |
| 📦 | **Prisma transaction batching** for record + audit writes | Fewer round trips, no connection-pool exhaustion |
| 🧮 | **Pure scorer, zero I/O** | Ranking cost is CPU-only and trivially parallelisable |

---

# 🔒 Security

```mermaid
flowchart LR
    R["🌐 Request"]:::i --> A["🔐 Clerk session"]:::s --> B["👮 RBAC permission<br/><sub>requirePermission('referral:generate')</sub>"]:::s --> C["✅ Zod schema"]:::s --> D["⚙️ Handler"]:::h
    D --> E["📜 Audit write"]:::a
    D --> F["🧹 PHI redaction<br/><sub>before Pino log stream</sub>"]:::a
    classDef i fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef s fill:#fee2e2,stroke:#b91c1c,stroke-width:2px,color:#0b1b2b
    classDef h fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef a fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
```

- 🧹 **PHI redaction** — middleware scrubs health records and credentials from log streams.
- 👮 **Granular RBAC** — permission checks at the gateway, not scattered through handlers.
- 📜 **Immutable audit** — every review action recorded with actor, IP, user-agent, and full state delta.

---

# 📈 Scalability

```mermaid
flowchart TB
    LB["⚖️ Load Balancer"]:::lb
    LB --> S1["⚙️ API #1"]:::api
    LB --> S2["⚙️ API #2"]:::api
    LB --> S3["⚙️ API #3"]:::api
    S1 & S2 & S3 --> RA["⚡ Redis adapter<br/><sub>Socket.IO fan-out across instances</sub>"]:::r
    S1 & S2 & S3 --> PB["🔗 PgBouncer"]:::pb --> PG[("🐘 Postgres")]:::db
    classDef lb fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#0b1b2b
    classDef api fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef r fill:#ffe4e6,stroke:#be123c,stroke-width:2px,color:#0b1b2b
    classDef pb fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef db fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
```

- **Stateless API** — no in-process session state, so instances scale horizontally behind a load balancer.
- **Redis Socket.IO adapter** — real-time broadcasts reach clients on every instance.
- **PgBouncer pooling** — absorbs connection spikes without exhausting Postgres.

---

# 🧪 Testing

```bash
pnpm test          # Vitest unit suites
```

| Suite | Covers |
|---|---|
| `safety.engine.test.ts` | Vital-threshold rules, red-flag evidence payloads |
| `routing.scorer.test.ts` | Factor normalisation, severity weighting, ranking order |

**Manual smoke checks**

- 🔴 Register a patient with SpO₂ `< 89%` → expect immediate emergency broadcast and ESI 1.
- ✏️ Record a doctor override with justification → expect a matching `audit_logs` row with old/new state.

---

# 🔄 CI/CD

```mermaid
flowchart LR
    A["📤 Push / PR"]:::i --> B["🧹 ESLint + Prettier"]:::c
    B --> C["🧪 Vitest"]:::c
    C --> D["🏗️ Build server + web images"]:::b
    D --> E["📦 Push to registry"]:::b
    E --> F["🚀 Railway API"]:::d
    E --> G["🚀 Vercel Web"]:::d
    classDef i fill:#e0f2fe,stroke:#0369a1,stroke-width:2px,color:#0b1b2b
    classDef c fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#0b1b2b
    classDef b fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#0b1b2b
    classDef d fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0b1b2b
```

---

# 🚢 Deployment

<div align="center">

| Component | Platform | Notes |
|---|---|---|
| 🖥️ **Web frontend** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) | Next.js edge/serverless runtime |
| ⚙️ **Backend API** | ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white) | Docker container |
| 🐘 **PostgreSQL** | Railway addon | Primary transactional store |
| ⚡ **Redis** | Railway addon | Cache + pub/sub |
| 🕸️ **Neo4j** | Neo4j Aura | Managed graph |
| 🌲 **Pinecone** | Managed | Guideline vectors |

</div>

---

# 📡 Monitoring & Logging

| | Tool | What it gives you |
|:---:|---|---|
| 🐛 | **Sentry** | Crash reports and backend runtime failures |
| 📝 | **Pino HTTP** | Structured JSON access logs with PHI redaction |
| ❤️ | **`/health/ready`** | Postgres · Redis · Neo4j status for cloud probes |
| 🧾 | **GenAI logger** | Per-call model usage, latency, and fallback reasons |

---

# 🚧 Limitations

> [!WARNING]
> - **Multimodal ingestion** depends on Gemini APIs and can throttle under high volume.
> - **Local fallbacks** do not fully simulate high-concurrency Clerk token exchange.
> - **Routing** assumes Haversine distance with an estimated travel time — no live traffic feed yet.

---

# 🔮 Future Improvements

```mermaid
timeline
    title Roadmap
    Next : 🎙️ Voice triage intake (field STT)
         : 🌐 Full multilingual UI (Hindi, Marathi)
    Then : 🚑 Ambulance dispatch + live ETA
         : 🚦 Traffic-aware travel time
    Later : 📱 Offline-first mobile intake
          : 🔗 State HMIS / ABDM interoperability
```

---

# 🎓 Lessons Learned

> 💡 **Human-in-the-loop is not a compliance checkbox.** Framing AI output as *cited advice* rather than a decision is what made clinicians willing to use it at all.

> 💡 **Split the stores by question shape.** Transactional history belongs in Postgres; "which hospital can actually take this patient" is a graph traversal. Forcing one store to do both made both slower.

> 💡 **A deterministic floor beats a better prompt.** No amount of prompt engineering gives the guarantee that ten lines of threshold checks give for free.

---

# 🤝 Contributing

```bash
git checkout -b feature/your-feature-name   # 1. branch
# 2. commit using Conventional Commits — enforced by commitlint + husky
git push origin feature/your-feature-name   # 3. open a PR against main
```

All PRs must pass lint, format, and the Vitest suites.

---

# 📜 License

**UNLICENSED** — developed for capstone project purposes.

---

# 📬 Contact

<div align="center">

[![Email](https://img.shields.io/badge/dev@jeevansetu.health-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dev@jeevansetu.health)
[![GitHub](https://img.shields.io/badge/jeevansetu--org-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jeevansetu)

</div>

---

# 🙏 Acknowledgements

<div align="center">

**LangChain & LangGraph** · stateful multi-agent orchestration
**Clerk** · authentication and RBAC
**WHO & ESI Committees** · public clinical triage protocols

<br/>

### 🩺 Built so that no patient is routed to the wrong door.

<sub>JeevanSetu — AI advises, a doctor decides.</sub>

</div>
