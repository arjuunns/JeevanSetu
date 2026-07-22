# JeevanSetu

> AI-Assisted Clinical Triage, Referral and Hospital Routing System with Human-in-the-Loop Validation.

[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)](#license)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#cicd)
[![Version](https://img.shields.io/badge/version-1.0.0--beta-blue.svg)](#overview)
[![Deploy](https://img.shields.io/badge/deployment-live-success.svg)](#deployment)

---

# Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Demo](#demo)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Core Modules](#core-modules)
- [Design Decisions](#design-decisions)
- [Challenges & Solutions](#challenges--solutions)
- [Trade-offs](#trade-offs)
- [Performance Optimizations](#performance-optimizations)
- [Security](#security)
- [Scalability](#scalability)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Lessons Learned](#lessons-learned)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

---

# Overview

## What is this project?

**JeevanSetu** is an AI-assisted clinical triage, hospital routing, and referral system designed to streamline emergency healthcare delivery. Operating as a unified patient flow network, it enables frontline healthcare workers (like triage nurses) to quickly capture vitals and symptoms, run a safety screening check, retrieve clinical guidelines using Retrieval-Augmented Generation (RAG), and route patients to nearby hospitals based on live department capacity and specialized medical infrastructure.

Importantly, JeevanSetu is built on the philosophy of **Human-in-the-Loop Validation**. It is designed to act as an intelligent co-pilot for healthcare providers. The system never makes autonomous, final medical assessments or referral assignments. All AI recommendations are subject to rigorous verification, adjustment, and override by a certified medical doctor before any patient is referred or transferred.

The monorepo contains a modern web application built on Next.js 15 App Router, coupled with a robust Node.js/Express backend API. It leverages advanced data engines including PostgreSQL for primary transaction records, Redis for caching and event streaming, Neo4j for resource-based hospital routing, and Pinecone for vector semantic guidelines retrieval.

## Who is it for?

JeevanSetu serves multiple distinct stakeholders within a regional healthcare network:
- **Triage Nurses / Frontline Caregivers**: Fast patient registration, automated vitals capture, instant safety warnings, and clinical symptom checklists.
- **Medical Doctors / Reviewers**: High-priority triage queues, guideline citation verification, AI triage approval/modification/override, and one-click referral generation.
- **Hospital Administrators**: Manage beds, ICU capacities, specialized departments, and active clinical staff levels.
- **Chief Medical Officers (CMO) / Health Authorities**: Real-time regional analytics, patient transfer flow tracking, capacity planning, and triage performance monitoring.
- **Super Administrators**: Manage users, system settings, RBAC permissions, and system audit trails.

## What problem does it solve?

During emergency situations and high-volume periods, emergency departments suffer from overcrowding, lack of resource coordination, and slow patient routing. Critically ill patients may be routed to hospitals lacking open beds or necessary equipment (e.g., a cath lab for cardiac arrests), while minor injuries overcrowd critical care spaces. Furthermore, clinicians struggle with outdated, hard-to-parse PDF guidelines under pressure.

JeevanSetu solves these problems by providing:
1. **A Safety-First Triage Floor**: A deterministic safety engine that identifies red flags and escalates high-risk cases instantly, ensuring they override any AI outputs.
2. **Context-Aware RAG Retrieval**: Extracting and presenting specific, verified medical guidelines directly inside the triage workflow to reduce cognitive load on clinicians.
3. **Optimized Resource Routing**: Using a graph-based routing engine to calculate the absolute best destination hospital based on real-time bed capacity, equipment matches, distance, and specialist availability.
4. **Standards-Based Interoperability**: Generating immutable referrals matching HL7 FHIR standards with accompanying secure PDF reports and offline-scannable QR codes.

---

# Problem Statement

### Real-World Problems:
- **Emergency Department Overcrowding**: Misallocation of patients leads to critical bottlenecks at tertiary trauma centers while community hospitals remain underutilized.
- **Critical Care Routing Failure**: Severe patients are frequently transported to facility sites that lack specialized equipment (e.g., ventilators, dialysis machines) or available specialists on duty, delaying life-saving treatment.
- **Cognitive Overload & Delayed Guideline Lookup**: Medical staff struggle to find and apply appropriate clinical guidelines (like WHO, ESI) during fast-paced triage events.
- **AI Hallucinations and Lack of Accountability**: Implementing standard LLMs in clinical scenarios poses huge patient safety risks when the models operate autonomously without explainable reasoning or human validation safeguards.

### How JeevanSetu Solves Them:
- **Live Resource Scorer**: Dynamically ranks hospitals based on distance, live capacity, equipment matches, and specialist profiles, ensuring patients are routed to the most optimal destination.
- **Deterministic Safety Gating**: Integrates a hardcoded safety rules engine (`safety.engine.ts`) that runs prior to any LLM execution, forcing immediate critical alerts when vital red flags trigger (e.g., oxygen saturation < 90%).
- **RAG-based Citation Tool**: Uses vector lookup in Pinecone to retrieve exact snippets, sections, and page numbers from official clinical handbooks, embedding them directly into the interface for doctor verification.
- **Doctor-in-the-Loop (DITL) Architecture**: Restricts all downstream operations (routing, referrals, notifications) until a doctor has formally reviewed and signed off on the triage decision.

---

# Features

## Core Features

- **Dynamic Patient Registration & Intake**: Quick data capture for vitals, symptoms, allergies, guardian details, and medical history.
- **Deterministic Safety Engine**: Evaluates red flags across pediatric, trauma, cardiac, respiratory, and neurological categories.
- **AI Triage Engine (LangGraph)**: Multi-step LLM-based triage agent pipeline that assigns severity levels and ESI classes with structured JSON schema outputs.
- **Medical PDF Ingestion & Retrieval (RAG)**: Multi-modal Python pipeline that parses guidelines, flowcharts, and tables into Pinecone, retrieving highly relevant semantic citations.
- **Smart Resource-Based Routing**: Graph-based candidate filtering via Neo4j combined with a multi-factor mathematical scoring engine.
- **FHIR R4 Compliant Referrals**: Automatically compiles triage and routing data into standardized HL7 FHIR referral bundles, complete with PDF prints and secure verification QR codes.
- **Real-Time Regional Dashboards**: Live WebSockets-powered analytics showing emergency broadcast counts, active department loads, and referral tracking maps.
- **Immutable Audit Logging**: Captures every state mutation, user role change, and review override with detailed system metadata (actor ID, IP, user-agent, timestamp).

## Technical Features

- **Authentication**: Fully integrated with Clerk for secure, modern session management.
- **Authorization**: Granular Role-Based Access Control (RBAC) supporting Nurse, Doctor, Admin, CMO, and Super Admin permissions.
- **Caching & Event Bus**: Utilizes Redis for high-speed session management, caching, and pub/sub message propagation.
- **Multi-Agent Pipeline**: LangGraph-orchestrated network of 7 specialized AI agents (Intake, Triage, RAG, Risk, Routing, Referral, and Supervisor).
- **File Uploads**: Secure S3-compatible object storage with a local filesystem fallback for development setups.
- **Real-time Notifications**: Multi-channel alerts sent via Email (Resend), SMS (Twilio), and In-App Toast messages (Socket.IO).

---

# Demo

## Live Demo
*App preview currently hosted on staging:* [https://jeevansetu-staging.vercel.app](https://jeevansetu-staging.vercel.app)

## Video Demo
*Project walkthrough and system interaction video:* [Watch Walkthrough](https://jeevansetu-staging.vercel.app/docs/demo.mp4)

## API Documentation
*Interactive Swagger and OpenAPI endpoint layout:* `http://localhost:4000/api/v1/docs`

---

# Screenshots

### 1. Nurse Patient Intake Dashboard
*Screen where nurses register incoming patients, record vital signs, and trigger the deterministic safety check.*

### 2. Doctor Triage Queue & RAG Citation Panel
*The primary workspace for physicians to review AI-generated triage findings, examine retrieved clinical guidelines, and approve the referral.*

### 3. Smart Routing Map and Scoring Engine
*Visual display of recommended hospitals, categorized by distance, bed capacity, and specialized equipment match metrics.*

### 4. CMO Regional Analytics Dashboard
*A high-level tracking tool displaying active regional patient transfer stats, hospital load heatmaps, and triage accuracy trends.*

---

# Architecture

## High-Level Architecture

JeevanSetu utilizes a monorepo setup running a clean layered architecture.

```mermaid
graph TD
    Client[Next.js Web App] <-->|HTTP / Socket.IO| API[Express API Server]
    API -->|Auth Guard| Clerk[Clerk Auth Service]
    API -->|ORM| Prisma[Prisma Client]
    Prisma -->|Primary Store| PG[(Postgres DB)]
    API -->|Graph Scorer| Neo4j[(Neo4j Graph DB)]
    API -->|Vector Query| PC[(Pinecone Index)]
    API -->|Multi-Agent| LG[LangGraph Orchestrator]
    API -->|Pub/Sub| Redis[(Redis Queue & Cache)]
    API -->|Notifications| NS[Resend / Twilio]
    API -->|Object Storage| S3[(AWS S3 / Local)]
```

## Request Flow

Below is the lifecycle of a patient triage check:

```
User (Nurse)
   │
   ▼
Frontend (Next.js)
   │ (Vitals & Symptom payload)
   ▼
API Gateway (Express)
   │ (Clerk session validation & RBAC validation)
   ▼
Deterministic Safety Floor (safety.engine.ts)
   ├─ If Critical Alert: Escalates to ESI 1 immediately
   └─ Otherwise: Passes to Triage Engine
   │
   ▼
LangGraph Triage Pipeline
   ├─ 1. Guideline Retrieval (Pinecone Vector Search)
   ├─ 2. Structured AI Triage (Gemini-2.0-Flash model)
   └─ 3. Supervisor Reconciliation (Enforces safety floor constraints)
   │
   ▼
PostgreSQL Transaction
   ├─ Visit record updated to UNDER_REVIEW
   └─ Write Immutable Audit Entry (action: VISIT_CREATED)
   │
   ▼
Real-time Socket.IO Broadcast (Metrics & Alerts Update)
   │
   ▼
Response Returned (Status 201)
```

## Component Diagram

- **`packages/types`**: Domain shapes, TypeScript interfaces, and validation schemas (Zod) shared by frontend and backend.
- **`apps/server`**: REST API endpoints, routing engines, RAG handlers, LangGraph agents, and database clients.
- **`apps/web`**: Responsive client dashboards built using Next.js 15 App Router, React Query, Socket.IO client, Tailwind, and Recharts.

---

# Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | Application Framework (App Router, Server Components) |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Styling and layout design |
| **React Query** | Server state synchronization and data fetching |
| **Socket.IO Client** | Live WebSocket connections for instant dashboards |
| **Recharts** | Interactive charting for analytics |
| **Framer Motion** | Micro-animations and page transitions |

## Backend

| Technology | Purpose |
|------------|---------|
| **Node.js / Express** | Web API server runtime and routing |
| **Prisma** | ORM for Postgres queries and transactions |
| **LangChain & LangGraph** | Multi-agent orchestration and structured JSON extraction |
| **Socket.IO** | WebSocket server for real-time broadcasts |
| **Pino** | High-performance, structured logging |
| **Zod** | Runtime request body validation |

## Database

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary transactional database (users, patients, reviews, audits) |
| **Neo4j** | Graph database for hospital resources, departments, and routing paths |
| **Pinecone** | Vector database for guideline embedding and semantic RAG retrieval |
| **Redis** | In-memory cache, task queues, and pub/sub message broker |

## Infrastructure & DevOps

| Technology | Purpose |
|------------|---------|
| **Docker / Compose** | Local environment provisioning and containerized deployments |
| **AWS S3** | Cloud document storage (Referral PDFs, guidelines) |
| **Clerk** | Unified authentication and RBAC user provisioning |
| **Resend** | Secure transaction email delivery |
| **Twilio** | SMS messaging for high-priority emergency notifications |
| **GitHub Actions** | Automated CI/CD pipeline |

---

# Project Structure

```text
jeevansetu/
├── apps/
│   ├── server/
│   │   ├── prisma/             # Schema, migrations, and database seed scripts
│   │   ├── src/
│   │   │   ├── config/         # Environment definitions and Logger setup
│   │   │   ├── lib/            # Shared clients (AI, Pinecone, Neo4j, Redis)
│   │   │   ├── middleware/     # Auth, RBAC guards, and request validators
│   │   │   ├── modules/        # Domain-driven features (Triage, Safety, Referrals, etc.)
│   │   │   └── app.ts          # Express application initialization
│   └── web/
│       ├── public/             # Static assets
│       ├── src/
│       │   ├── app/            # Next.js App Router structure
│       │   ├── components/     # UI primitives and composite layout items
│       │   ├── context/        # React context (Language, WebSockets)
│       │   └── hooks/          # Data hook interfaces (React Query wrapper)
├── packages/
│   ├── types/                  # Single source of truth for domain TS types and Zod schemas
│   ├── config/                 # ESLint and TypeScript presets
│   └── ui/                     # Shared base design system components
├── docker/                     # Compose setups and Dockerfiles
└── docs/                       # Project specifications and architecture papers
```

---

# Getting Started

## Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v20 or higher)
- **pnpm** (v9 or higher)
- **Docker** and **Docker Compose**
- **Git**

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/JeevanSetu.git
   cd JeevanSetu
   ```

2. **Install project dependencies:**
   ```bash
   pnpm install
   ```

3. **Start local infrastructure (PostgreSQL, Redis, Neo4j):**
   ```bash
   pnpm docker:up
   ```

4. **Initialize the database:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   *The frontend will run at `http://localhost:3000` and the backend will run at `http://localhost:4000`.*

---

## Environment Variables

Copy the template file to set up your environment variables:
```bash
cp .env.example .env
```

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://postgres:postgres@localhost:5432/jeevansetu` |
| `REDIS_URL` | Redis server URL | No | `redis://localhost:6379` |
| `GEMINI_API_KEY` | Google Gemini API key | No (Fallback to deterministic) | `DUMMY_GEMINI_KEY` |
| `PINECONE_API_KEY`| Pinecone API key | No (Disables RAG citations) | |
| `NEO4J_URI` | Neo4j endpoint URI | No (Fallback to Postgres) | `bolt://localhost:7687` |
| `CLERK_SECRET_KEY`| Clerk backend authentication key | No (Bypasses Auth in Dev) | |

---

# Configuration

Important tool configurations in the project:
- **`pnpm-workspace.yaml`**: Coordinates the monorepo workspace dependencies.
- **`turbo.json`**: Optimizes monorepo builds by caching compile tasks.
- **`prisma/schema.prisma`**: Defines database schemas, indexes, and PostgreSQL extensions.
- **`apps/server/src/config/env.ts`**: Handles validation and type checking of environment configurations on boot.

---

# API Documentation

## Health & System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check if server is running |
| `GET` | `/health/ready` | Check if databases (Postgres, Redis, Neo4j) are ready |

## Patient & Intake

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/patients/intake` | Register patient and create a clinical visit |
| `POST` | `/api/v1/patients/visits/:id/vitals` | Record patient vital signs |

## Triage & Guidelines

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/triage/visits/:id/safety-screen` | Run deterministic safety floor checks |
| `POST` | `/api/v1/triage/visits/:id/triage` | Trigger multi-agent AI triage assessment |
| `GET` | `/api/v1/guidelines` | List all ingested medical guidelines |
| `POST` | `/api/v1/guidelines/upload` | Upload and ingest a new guideline PDF |

## Review, Routing & Referrals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/reviews/queue` | Retrieve active triage cases requiring doctor approval |
| `POST` | `/api/v1/reviews/visits/:id/review` | Approve/modify/override triage results |
| `POST` | `/api/v1/routing` | Calculate ranked hospital routing list |
| `POST` | `/api/v1/referrals/visits/:id/generate` | Generate official clinical referral and FHIR bundle |

---

# Database Design

## ER Diagram

```
[User] 1 ──── * [Patient]
  │                │
  │                *
[DoctorReview] *── 1 [Visit] 1 ──── 1 [TriageAssessment] 1 ── * [GuidelineCitation]
  │                │
  │                ├───── 1 [HospitalRouting]
  │                └───── 1 [Referral] 1 ──── * [ReferralDocument]
  *
[AuditLog]
```

## Core Tables

### 1. `users`
- **Purpose**: Identity record with Clerk synchronization. Stores user profile and application roles.
- **Columns**: `id`, `clerkUserId`, `email`, `firstName`, `lastName`, `role`, `hospitalId`, `isActive`.
- **Relationships**: Many-to-many relationship with Audit logs; linked to doctor reviews and registered patients.

### 2. `patients`
- **Purpose**: Stores patient identity data and static demographic parameters.
- **Columns**: `id`, `mrn` (Medical Record Number), `name`, `age`, `gender`, `bloodGroup`, `allergies`, `registeredById`.
- **Relationships**: Linked to multiple visits.

### 3. `visits`
- **Purpose**: Represents a specific emergency check-in event. Bridges intake, triage, reviews, routing, and referrals.
- **Columns**: `id`, `patientId`, `status` (`REGISTERED`, `TRIAGED`, `UNDER_REVIEW`, `APPROVED`, `REFERRED`), `arrivalAt`.

### 4. `audit_logs`
- **Purpose**: Immutable history trail.
- **Columns**: `id`, `action`, `entityType`, `entityId`, `actorId`, `oldState`, `newState`, `ipAddress`, `userAgent`.

---

# Core Modules

## 1. Safety Layer (`apps/server/src/modules/safety`)
- **Purpose**: Deterministically filters critical patient vitals and symptoms before AI evaluation.
- **Key Files**: [safety.engine.ts](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/apps/server/src/modules/safety/safety.engine.ts)
- **Flow**: Evaluates vital bounds (e.g., oxygen saturation `< 90%`, GCS score `≤ 8`) and matches priority symptoms. Raises immediate system notifications and alerts if critical criteria are met.

## 2. AI Triage Engine (`apps/server/src/modules/triage`)
- **Purpose**: Generates diagnostic assessments, ESI classifications, and clinical summaries.
- **Key Files**: [triage.engine.ts](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/apps/server/src/modules/triage/triage.engine.ts)
- **Flow**: Retrieves guideline snippets, calls Google Gemini with strict structured schemas, and applies supervisor rules to reconcile AI severity output with the safety floor.

## 3. Hospital Routing Module (`apps/server/src/modules/routing`)
- **Purpose**: Recommends destination hospitals matching specific emergency demands.
- **Key Files**: [routing.service.ts](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/apps/server/src/modules/routing/routing.service.ts), [geo.ts](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/apps/server/src/modules/routing/geo.ts)
- **Flow**: Traverses hospital capacities in Neo4j (or PostgreSQL fallback) and scores candidates based on Haversine distance, specialist rosters, emergency tiering, and bed inventory.

---

# Design Decisions

- **Deterministic Safety Gating**: Standard LLMs cannot guarantee bounds for critical health events. Thus, a hardcoded TS rules engine runs *prior* to AI triage. AI serves as an advisory assistant, but the safety floor is absolute.
- **Graph Database (Neo4j) for Routing**: Relational models are inefficient at calculating multi-layered relationships (e.g., matching a patient requiring a *Cardiologist* + *ICU Bed* + *Ventilator* within a specific driving network). Graph relationships resolve this instantly.
- **Zod for Shared Types**: Defining validation logic in Zod schemas inside `packages/types` ensures the frontend forms and backend REST controllers share an identical schema layout.

---

# Challenges & Solutions

### Challenge: External Model Quotas and Availability
- **Problem**: In local testing, missing API keys or Gemini free-tier rate limits could stall development.
- **Solution**: Feature-flagged resilience layers. If a key is missing or calls fail, the server degrades gracefully to a local rule-based assessor, marking outputs clearly as `[DETERMINISTIC FALLBACK]`.

### Challenge: RAG Retrieval Accuracy
- **Problem**: Standard text chunking broke important flowcharts and triage tables across pages.
- **Solution**: Implemented a hybrid Python script that extracts tables and converts images of flowchart trees using Gemini Vision, storing them as atomic, undivided database chunks.

---

# Trade-offs

### Clerk (Third-Party Auth) vs Self-Hosted JWT
- **Chosen**: Clerk
- **Pros**: Instant integration, built-in MFA, session logging, and easy RBAC role management.
- **Cons**: Dependency on external network connections and subscription pricing limits.
- **Impact**: Bypassed in dev environments using a local mock auth user to minimize latency and dependency during development.

---

# Performance Optimizations

- **Redis Query Caching**: Active hospital bed capacities are updated frequently. Capacity query results are cached in Redis with an automatic write-through invalidation strategy.
- **Matryoshka Embeddings Truncation**: Truncates 3072-dimension vectors down to 1024 dimensions before indexing. This reduces vector payload size and latency on Pinecone queries.
- **Prisma Transaction Batches**: Multiple database logs and record creations are executed as isolated, single database transactions to avoid connection pool exhaustion.

---

# Security

- **PHI Redaction**: Strict middleware controls that scrub health records and authentication details from Pino log streams.
- **Granular RBAC**: API endpoints enforce role checks (`requirePermission('referral:generate')`) at the gateway layer.
- **Audit Verification**: Immutable audit records are compiled for every review action with automatic verification checks.

---

# Scalability

- **Stateless API Design**: The Express server retains no active context state, enabling seamless horizontal scaling behind a standard load balancer.
- **WebSocket Event Bus**: Socket.IO connects to a Redis adapter, enabling real-time metrics broadcasts to propagate correctly across multiple server instances.
- **Prisma Connection Pooling**: Configured with PgBouncer to manage high database connection spikes.

---

# Testing

## Unit Tests
Includes tests for deterministic vital checkers and the routing scorer.
```bash
# Execute unit test suites
pnpm test
```

## Manual Testing
- Create a test patient with high-risk vitals (e.g., SpO2 `< 89%`) to verify instant emergency broadcasts.
- Mock a doctor override justification to verify details are recorded in the audit trail.

---

# CI/CD

```
Code Push (GitHub)
   │
   ▼
Linting & Formatting Checks (ESLint + Prettier)
   │
   ▼
Run Test Suites (Vitest)
   │
   ▼
Build Docker Images (Server & Web)
   │
   ▼
Push Containers to Registry (Railway / Vercel Deploy)
```

---

# Deployment

- **Web Frontend**: Hosted on Vercel (Next.js client environment).
- **Backend API**: Running inside a Railway Docker container.
- **Managed Services**: Postgres (Railway Addon), Redis (Railway Addon), Neo4j Aura (Managed Graph).

---

# Monitoring & Logging

- **Sentry**: Tracks application crash reports and backend runtime failures.
- **Pino HTTP Logging**: Formats all incoming traffic into structured JSON output.
- **Health Check Endpoint**: `/health/ready` evaluates status of Postgres, Redis, and Neo4j, exposing stats to cloud monitors.

---

# Limitations

- **Multimodal ingestion**: Python ingestion relies on Gemini APIs and may fail or throttle under high volume.
- **Local Fallbacks**: Local mock interfaces do not fully simulate high-concurrency Clerk token exchanges.

---

# Future Improvements

- **Voice Triage Intake**: Introduce automated speech-to-text intake for field workers recording patient details on mobile devices.
- **Ambulance Dispatch Integration**: Track ambulance locations and dynamically update hospital ETA metrics.
- **Multilingual Support**: Fully translate UI panels to support regional regional languages (e.g., Hindi, Marathi).

---

# Lessons Learned

- **Human-in-the-Loop is Essential**: Healthcare AI must never serve as the ultimate decision-maker; framing AI outputs as advisory citations drastically improves clinician trust.
- **Separation of Graph/Relational**: Keeping transactional patient history in PostgreSQL while offloading structural networks to Neo4j yields superior query speed and cleaner schema updates.

---

# Contributing

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Commit changes**: Ensure commits follow the Conventional Commits standard.
3. **Pull Request**: Open a PR against the `main` branch. Ensure all tests pass.

---

# License

**UNLICENSED** - Developed solely for capstone project purposes.

---

# Contact

- **Project Lead**: JeevanSetu Engineering Team
- **Email**: dev@jeevansetu.health
- **GitHub**: [jeevansetu-org](https://github.com/jeevansetu)

---

# Acknowledgements

- **LangChain & LangGraph Teams** for stateful multi-agent orchestrator tools.
- **Clerk** for authentication security systems.
- **WHO and ESI Committees** for public clinical triage handbook protocols.
