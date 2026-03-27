# JeevanSetu - Master Development Task

## Project Overview

Build a production-ready healthcare platform called **JeevanSetu**.

JeevanSetu is an AI Assisted Clinical Triage, Referral and Hospital Routing System with Human-in-the-Loop Validation.

The platform assists healthcare workers in collecting patient information, assessing severity, retrieving medical guidelines, generating referrals, routing patients to suitable hospitals, and monitoring healthcare operations through centralized dashboards.

The system must NEVER make autonomous medical decisions. Every AI recommendation requires human approval.

---

# Core Objectives

* Collect structured patient information
* Perform AI-assisted clinical triage
* Detect life-threatening emergencies
* Retrieve official medical guidelines using RAG
* Suggest appropriate departments and specialists
* Route patients to suitable hospitals
* Generate referral documents
* Enable doctor review and override workflows
* Provide hospital and system monitoring dashboards
* Maintain complete audit trails

---

# Tech Stack

## Frontend

* Next.js 15 App Router
* TypeScript
* Tailwind CSS
* Shadcn UI
* React Query
* Zustand
* Framer Motion
* Recharts

## Backend

* Node.js
* Express
* TypeScript

## Databases

### Primary Database

* PostgreSQL
* Prisma ORM

### Cache

* Redis

### Vector Database

* Pinecone

### Graph Database

* Neo4j

## AI Stack

* Gemini Models
* LangChain
* LangGraph

## Authentication

* Clerk

## Storage

* AWS S3

## Deployment

* Docker
* Railway
* Vercel

## Monitoring

* Sentry
* OpenTelemetry

---

# User Roles

## Nurse

Permissions:

* Register patients
* Record symptoms
* Record vitals
* View recommendations

## Doctor

Permissions:

* Review triage
* Approve recommendations
* Override recommendations
* Generate referrals

## Hospital Admin

Permissions:

* Manage hospitals
* Manage specialists
* Update bed capacity
* Manage departments

## CMO

Permissions:

* View analytics
* View hospital load
* View referral trends
* View system performance

## Super Admin

Permissions:

* Manage users
* Manage hospitals
* Manage AI settings
* Manage audit logs

---

# Phase 1 - Project Foundation

## Setup Monorepo

Create:

apps/
web/

server/

packages/
ui/

types/

config/

docker/

docs/

---

## Configure

* ESLint
* Prettier
* Husky
* Lint Staged
* Commitlint
* CI/CD
* Environment Validation

---

# Phase 2 - Authentication

Implement Clerk authentication.

Features:

* Login
* Signup
* Role Based Access Control
* Session Management
* Protected Routes
* Middleware Guards

---

# Phase 3 - Database Design

Create Prisma schemas.

Tables:

* User
* Patient
* MedicalHistory
* Visit
* VitalSigns
* Symptom
* Hospital
* Department
* Specialist
* TriageAssessment
* TriageDecision
* AIReasoning
* DoctorReview
* HospitalRouting
* Referral
* ReferralDocument
* HospitalCapacity
* HospitalResource
* Guideline
* GuidelineChunk
* Notification
* AuditLog
* AgentExecution
* EmergencyAlert
* SystemMetrics

Requirements:

* Soft Deletes
* Audit Fields
* Proper Indexes
* Foreign Keys
* Optimized Queries

---

# Phase 4 - Patient Intake Module

Build patient registration workflow.

## Patient Information

Capture:

* Name
* Age
* Gender
* Phone
* Blood Group
* Height
* Weight
* Allergies
* Existing Diseases
* Medications

## Vital Signs

Capture:

* Temperature
* Oxygen Saturation
* Heart Rate
* Respiratory Rate
* Blood Pressure

## Symptoms

Capture:

* Primary Symptom
* Secondary Symptoms
* Duration
* Severity

Store all information in PostgreSQL.

---

# Phase 5 - Safety Layer

Build deterministic medical safety engine.

Critical Conditions:

* Cardiac Arrest
* Stroke
* Severe Trauma
* Unconscious Patient
* Extremely Low Oxygen
* Severe Bleeding

Rules must always override AI.

Examples:

IF oxygen < 90
THEN critical

IF chest pain + oxygen < 92
THEN critical

IF unconscious
THEN critical

Safety layer executes before AI.

---

# Phase 6 - AI Triage Engine

Build LangGraph workflow.

Input:

* Symptoms
* Vitals
* Medical History

Output:

{
severity,
confidence,
reasoning,
possible_conditions,
recommended_department,
recommended_tests,
risk_factors
}

Requirements:

* Structured JSON Output
* Retry Logic
* Validation Layer
* Hallucination Prevention
* Logging

---

# Phase 7 - Medical RAG System

Admin uploads:

* WHO Guidelines
* ICMR Guidelines
* ESI Guidelines
* MTS Guidelines

Pipeline:

Upload PDF
→ Extract Text
→ Chunk
→ Embed
→ Store in Pinecone
→ Save Metadata

During triage:

Retrieve:

* Top Relevant Chunks
* Citations
* Sources

Display evidence to doctors.

---

# Phase 8 - Human In The Loop

Doctor Review Dashboard.

Display:

* Patient Summary
* AI Severity
* Confidence Score
* Reasoning
* Guideline Citations
* Risk Factors

Actions:

* Approve
* Modify
* Override
* Reject

Require override justification.

Store every action.

---

# Phase 9 - Hospital Management

Hospital Profile:

* Name
* Address
* Coordinates
* ICU Beds
* General Beds
* Ventilators
* Ambulances
* Trauma Center
* Emergency Level

Realtime capacity updates.

---

# Phase 10 - Smart Routing Engine

Build Neo4j graph.

Consider:

* Distance
* Capacity
* Specialists
* Equipment
* Severity
* Travel Time

Output:

Ranked Hospital List

Include:

* Score
* Reasoning
* Route Explanation

---

# Phase 11 - Referral Generation

Generate:

## PDF Referral

Include:

* Patient Summary
* Symptoms
* Vitals
* Severity
* AI Reasoning
* Doctor Approval
* Recommended Hospital

## FHIR JSON

Generate HL7 FHIR compliant referral.

## QR Code

Generate shareable QR.

---

# Phase 12 - Multi-Agent Architecture

Agent 1:
Patient Intake Agent

Agent 2:
Triage Agent

Agent 3:
Guideline Retrieval Agent

Agent 4:
Risk Assessment Agent

Agent 5:
Routing Agent

Agent 6:
Referral Generation Agent

Agent 7:
Supervisor Agent

Supervisor validates all outputs.

---

# Phase 13 - Notifications

Implement:

* Email
* SMS
* In-App Notifications

Events:

* Emergency Alert
* Referral Generated
* Doctor Review Required
* Capacity Warning

---

# Phase 14 - Realtime Dashboard

## CMO Dashboard

Metrics:

* Total Patients
* Critical Patients
* Referral Count
* Triage Time
* Routing Success Rate
* Override Rate
* Hospital Occupancy
* AI Confidence Trends

Charts:

* Severity Distribution
* Referral Trends
* Occupancy Trends
* Hospital Load
* Geographic Routing Map

Realtime Updates using WebSockets.

---

# Phase 15 - Audit System

Track:

* Patient Created
* Vitals Updated
* AI Executed
* Doctor Approved
* Doctor Overridden
* Referral Generated
* Hospital Assigned

Store:

* User
* Timestamp
* Previous State
* New State
* IP Address
* Device Information

---

# Phase 16 - Testing

Create:

## Unit Tests

* Services
* APIs
* Utilities

## Integration Tests

* Database
* AI Pipelines
* Routing

## E2E Tests

* Playwright

## Performance Tests

* Load Testing
* Stress Testing

Target:

80%+ Coverage

---

# Phase 17 - DevOps

Generate:

* Dockerfiles
* Docker Compose
* GitHub Actions
* Railway Deployment
* Vercel Deployment
* Health Checks
* Monitoring
* Backups
* Rollback Strategy

---

# Phase 18 - Advanced Features

## Voice Triage

Speech-to-Text intake.

## Predictive Bed Occupancy

Forecast shortages.

## Ambulance Tracking

Realtime GPS.

## Multilingual Support

* English
* Hindi
* Punjabi

## Emergency Broadcast System

Notify specialists instantly.

---

# Development Order

1. Project Setup
2. Authentication
3. Database
4. Patient Intake
5. Safety Layer
6. AI Triage
7. RAG
8. Doctor Review
9. Hospital Management
10. Routing Engine
11. Referral Generator
12. Multi-Agent System
13. Dashboard
14. Notifications
15. Audit System
16. Testing
17. Deployment

---

# Important Rules

* Never skip implementation.
* Never use placeholder logic.
* Generate production-grade code.
* Follow clean architecture principles.
* Use scalable folder structures.
* Use TypeScript everywhere.
* Add documentation for every module.
* Add tests for every critical feature.
* Prioritize patient safety over AI recommendations.
* Every AI output must be explainable and auditable.
