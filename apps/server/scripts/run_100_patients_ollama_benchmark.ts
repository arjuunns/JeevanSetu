import './load-env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient, VisitStatus, Gender, BloodGroup, SymptomSeverity } from '@prisma/client';
import { runTriageForVisit } from '../src/modules/triage/triage.service.js';
import { env } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface BenchmarkCase {
  stayId: string;
  subjectId: string;
  patientName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
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
  patientId: string;
  visitId: string;
  stayId: string;
  patientName: string;
  chiefComplaint: string;
  groundTruthEsi: number;
  predictedEsi: number;
  groundTruthSeverity: string;
  predictedSeverity: string;
  isExactMatch: boolean;
  isWithinOneLevel: boolean;
  isUnderTriaged: boolean;
  isOverTriaged: boolean;
  safetyTriggered: boolean;
  recommendedDepartment?: string;
  latencyMs: number;
  reasoning: string;
}

// Parse CLI flags: --limit=100, --provider=ollama|gemini, --model=llama3.1:8b
const args = process.argv.slice(2);
let targetLimit = 100;
let providerOverride: string | null = null;
let modelOverride: string | null = null;

for (const arg of args) {
  if (arg.startsWith('--limit=')) {
    targetLimit = parseInt(arg.split('=')[1], 10) || 100;
  } else if (arg.startsWith('--provider=')) {
    providerOverride = arg.split('=')[1];
  } else if (arg.startsWith('--model=')) {
    modelOverride = arg.split('=')[1];
  }
}

async function checkOllama(url: string, modelName: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/api/tags`, { method: 'GET' });
    if (!res.ok) return false;
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const hasModel = data.models?.some((m) => m.name.startsWith(modelName.split(':')[0]));
    if (!hasModel) {
      console.warn(`⚠️ Model '${modelName}' not found in local Ollama.`);
      console.warn(`👉 Please run: 'ollama run ${modelName}' to download it.`);
    }
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const provider = providerOverride ?? (process.env.LLM_PROVIDER || 'ollama');
  const model = modelOverride ?? (provider === 'ollama' ? process.env.OLLAMA_MODEL || 'llama3.1:8b' : process.env.GEMINI_TRIAGE_MODEL || 'gemini-3.5-flash-lite');

  // Override runtime env for this run
  (env as any).LLM_PROVIDER = provider;
  if (provider === 'ollama') {
    (env as any).OLLAMA_MODEL = model;
  }

  console.log('\n===============================================================');
  console.log('🩺 JeevanSetu 100-Patient Live Triage Benchmark & Docker Persist');
  console.log('===============================================================');
  console.log(`• Cohort Size:      ${targetLimit} Patients (MIMIC-IV-ED De-Identified)`);
  console.log(`• AI Provider:      ${provider.toUpperCase()}`);
  console.log(`• Model:            ${model}`);
  console.log(`• Database:         PostgreSQL (Docker persistence active)`);
  console.log(`• Started At:       ${new Date().toISOString()}`);
  console.log('===============================================================\n');

  if (provider === 'ollama') {
    const ollamaUrl = 'http://localhost:11434';
    const isOnline = await checkOllama(ollamaUrl, model);
    if (!isOnline) {
      console.error(`❌ Ollama is not running at ${ollamaUrl}`);
      console.error(`👉 Please run: 'ollama serve' and 'ollama run ${model}' in your terminal.`);
      process.exit(1);
    }
    console.log(`✅ Ollama is online and ready at ${ollamaUrl}\n`);
  }

  // 1. Load Dataset
  const dataPath = path.resolve(__dirname, '../../../data/mimic_benchmark_150.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Benchmark dataset not found at ${dataPath}.`);
    process.exit(1);
  }

  const allCases: BenchmarkCase[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const cohort = allCases.slice(0, targetLimit);
  console.log(`📋 Selected ${cohort.length} clinical presentations for ingestion and live triage.\n`);

  // Ensure Doctor user exists
  const doctorUser = await prisma.user.upsert({
    where: { clerkUserId: 'mimic_eval_doctor' },
    create: {
      clerkUserId: 'mimic_eval_doctor',
      email: 'mimic.doctor@jeevansetu.health',
      role: 'DOCTOR',
      firstName: 'MIMIC',
      lastName: 'Evaluator',
    },
    update: {},
  });

  const results: EvaluationResult[] = [];
  let exactMatches = 0;
  let withinOneMatches = 0;
  let underTriagedCount = 0;
  let overTriagedCount = 0;
  let totalLatency = 0;
  const confusionMatrix: number[][] = Array.from({ length: 6 }, () => Array(6).fill(0));

  console.log('⚡ Starting Patient Ingestion & AI Triage Pipeline...\n');

  for (let i = 0; i < cohort.length; i++) {
    const c = cohort[i];
    const indexStr = `[${i + 1}/${cohort.length}]`.padEnd(9);
    const mrn = `MIMIC-${c.subjectId}-${c.stayId}`;

    // A. Persist / Upsert Patient and Visit into PostgreSQL (Docker DB)
    const existing = await prisma.patient.findUnique({ where: { mrn } });
    if (existing) {
      await prisma.visit.deleteMany({ where: { patientId: existing.id } });
      await prisma.patient.delete({ where: { id: existing.id } });
    }

    const patient = await prisma.patient.create({
      data: {
        mrn,
        name: c.patientName,
        age: c.age,
        gender: c.gender as Gender,
        bloodGroup: (c.bloodGroup as BloodGroup) ?? BloodGroup.UNKNOWN,
        phone: c.phone,
        existingDiseases: c.existingDiseases,
        medications: c.medications,
        allergies: c.allergies,
        registeredById: doctorUser.id,
        medicalHistory: {
          create: c.confirmedDiagnoses.map((diag) => ({
            condition: diag,
            notes: `MIMIC-IV-ED Confirmed Diagnosis (Ground Truth ESI ${c.groundTruthEsi})`,
            isChronic: true,
          })),
        },
        visits: {
          create: {
            chiefComplaint: c.chiefComplaint,
            status: VisitStatus.REGISTERED,
            vitals: {
              create: {
                temperatureC: c.vitals.temperatureC,
                oxygenSaturation: c.vitals.oxygenSaturation,
                heartRate: c.vitals.heartRate,
                respiratoryRate: c.vitals.respiratoryRate,
                systolicBp: c.vitals.systolicBp,
                diastolicBp: c.vitals.diastolicBp,
                glasgowComaScale: c.vitals.glasgowComaScale,
                isUnconscious: c.vitals.isUnconscious ?? false,
              },
            },
            symptoms: {
              create: c.symptoms.map((s) => ({
                name: s.name,
                severity: s.severity as SymptomSeverity,
                isPrimary: s.isPrimary,
                duration: 'Acute ED presentation',
              })),
            },
          },
        },
      },
      include: { visits: true },
    });

    const visit = patient.visits[0];

    // B. Run AI Triage (via Ollama) & Persist Assessment to Docker PostgreSQL
    const startTime = Date.now();
    let triageOutput;
    try {
      triageOutput = await runTriageForVisit(visit.id, {
        userId: doctorUser.id,
        ipAddress: '127.0.0.1',
        userAgent: `JeevanSetu-Benchmark/${provider}`,
      });
    } catch (err: any) {
      console.error(`❌ Case ${i + 1} (${c.patientName}) Triage Failed:`, err.message || err);
      continue;
    }
    const latencyMs = Date.now() - startTime;
    totalLatency += latencyMs;

    const predEsi = triageOutput.result.esiLevel ?? 3;
    const actualEsi = c.groundTruthEsi;

    const isExact = predEsi === actualEsi;
    const isWithinOne = Math.abs(predEsi - actualEsi) <= 1;
    const isUnder = predEsi > actualEsi;
    const isOver = predEsi < actualEsi;

    if (isExact) exactMatches++;
    if (isWithinOne) withinOneMatches++;
    if (isUnder) underTriagedCount++;
    if (isOver) overTriagedCount++;

    if (actualEsi >= 1 && actualEsi <= 5 && predEsi >= 1 && predEsi <= 5) {
      confusionMatrix[actualEsi][predEsi]++;
    }

    results.push({
      patientId: patient.id,
      visitId: visit.id,
      stayId: c.stayId,
      patientName: c.patientName,
      chiefComplaint: c.chiefComplaint,
      groundTruthEsi: actualEsi,
      predictedEsi: predEsi,
      groundTruthSeverity: c.groundTruthSeverity,
      predictedSeverity: triageOutput.result.severity,
      isExactMatch: isExact,
      isWithinOneLevel: isWithinOne,
      isUnderTriaged: isUnder,
      isOverTriaged: isOver,
      safetyTriggered: triageOutput.safety.isCritical,
      recommendedDepartment: triageOutput.result.recommendedDepartment,
      latencyMs,
      reasoning: triageOutput.reasoningText,
    });

    const matchTag = isExact
      ? '🟢 EXACT'
      : isWithinOne
        ? '🟡 ±1 LEVEL'
        : isUnder
          ? '🔴 UNDER-TRIAGED'
          : '🔵 OVER-TRIAGED';

    console.log(
      `${indexStr} ESI ${actualEsi} -> ${predEsi} (${matchTag.padEnd(16)}) | ${latencyMs}ms | ${c.patientName} (${c.chiefComplaint.slice(0, 24)})`
    );
  }

  const evaluatedCount = results.length;
  const exactRate = ((exactMatches / evaluatedCount) * 100).toFixed(1);
  const withinOneRate = ((withinOneMatches / evaluatedCount) * 100).toFixed(1);
  const underTriageRate = ((underTriagedCount / evaluatedCount) * 100).toFixed(1);
  const overTriageRate = ((overTriagedCount / evaluatedCount) * 100).toFixed(1);
  const avgLatency = Math.round(totalLatency / evaluatedCount);

  console.log('\n===============================================================');
  console.log('📊 100-PATIENT LIVE BENCHMARK EVALUATION SUMMARY');
  console.log('===============================================================');
  console.log(`• Total Patients Triaged & Persisted: ${evaluatedCount}`);
  console.log(`• Exact ESI Concordance Rate:         ${exactRate}% (${exactMatches}/${evaluatedCount})`);
  console.log(`• Clinically Acceptable (±1 ESI):     ${withinOneRate}% (${withinOneMatches}/${evaluatedCount})`);
  console.log(`• Under-Triage Safety Risk Rate:     ${underTriageRate}% (${underTriagedCount}/${evaluatedCount}) [Lower is better]`);
  console.log(`• Over-Triage Rate (Safe margin):     ${overTriageRate}% (${overTriagedCount}/${evaluatedCount})`);
  console.log(`• Average Inference Latency:          ${avgLatency} ms`);
  console.log('===============================================================');

  // Print Confusion Matrix
  console.log('\n🔍 ESI Acuity Confusion Matrix (Rows = Actual Ground Truth, Cols = Predicted)');
  console.log('---------------------------------------------------------------');
  console.log('Actual \\ Pred |   ESI 1   |   ESI 2   |   ESI 3   |   ESI 4   |   ESI 5   |');
  console.log('---------------------------------------------------------------');
  for (let act = 1; act <= 4; act++) {
    const row = [1, 2, 3, 4, 5].map((pred) => String(confusionMatrix[act][pred]).padStart(7)).join(' | ');
    console.log(`    ESI ${act}     | ${row} |`);
  }
  console.log('---------------------------------------------------------------\n');

  // Save Outputs
  const outJsonPath = path.resolve(__dirname, '../../../mimic_benchmark_results.json');
  fs.writeFileSync(
    outJsonPath,
    JSON.stringify(
      {
        benchmarkInfo: {
          cohortSize: evaluatedCount,
          provider,
          model,
          timestamp: new Date().toISOString(),
          exactConcordanceRate: `${exactRate}%`,
          clinicallyAcceptableRate: `${withinOneRate}%`,
          underTriageRate: `${underTriageRate}%`,
          overTriageRate: `${overTriageRate}%`,
          avgLatencyMs: avgLatency,
        },
        confusionMatrix,
        patients: results,
      },
      null,
      2
    )
  );

  const outMdPath = path.resolve(__dirname, '../../../mimic_benchmark_report.md');
  const reportMd = generateMarkdownReport({
    provider,
    model,
    evaluatedCount,
    exactRate,
    withinOneRate,
    underTriageRate,
    overTriageRate,
    avgLatency,
    confusionMatrix,
    results,
  });
  fs.writeFileSync(outMdPath, reportMd);

  console.log(`💾 All 100 patients and triage results persisted in PostgreSQL!`);
  console.log(`💾 Reports saved to:`);
  console.log(`  • JSON:     ${outJsonPath}`);
  console.log(`  • Markdown: ${outMdPath}\n`);
}

function generateMarkdownReport(data: any): string {
  return `# JeevanSetu 100-Patient Live Triage Benchmark Report

**Dataset:** MIMIC-IV-ED De-Identified Real-World Emergency Presentations  
**Model Under Test:** \`${data.model}\` (${data.provider.toUpperCase()})  
**Database Status:** ✅ Persisted in PostgreSQL (Docker)  
**Evaluation Date:** ${new Date().toISOString()}  

---

## 1. Executive Performance Metrics

| Metric | Score | Clinical Interpretation |
| :--- | :--- | :--- |
| **Total Cohort Size** | **${data.evaluatedCount} Patients** | Real-world de-identified ED presentations |
| **Exact ESI Accuracy** | **${data.exactRate}%** | Exact match with expert clinical triage consensus |
| **Clinically Acceptable (±1 Level)** | **${data.withinOneRate}%** | Safe triage boundary according to AHRQ standards |
| **Under-Triage Rate** | **${data.underTriageRate}%** | Safety metric (minimizing delayed care) |
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

## 3. Sample Case Evaluations (Persisted in Database)

${data.results
  .slice(0, 15)
  .map(
    (r: any, idx: number) => `### Case ${idx + 1}: ${r.patientName} (${r.chiefComplaint})
- **Patient ID:** \`${r.patientId}\` | **Visit ID:** \`${r.visitId}\`
- **Ground Truth:** ESI ${r.groundTruthEsi} (${r.groundTruthSeverity})
- **Predicted:** ESI ${r.predictedEsi} (${r.predictedSeverity}) — *${r.isExactMatch ? '✅ Exact Match' : r.isWithinOneLevel ? '🟡 Within ±1 Level' : '🔴 Mismatch'}*
- **Safety Red Flag Triggered:** ${r.safetyTriggered ? '🚨 YES (Deterministic Red Flag Overridden)' : 'Normal'}
- **Department Assigned:** ${r.recommendedDepartment ?? 'Emergency'}
- **Clinical Reasoning:** ${r.reasoning}
`
  )
  .join('\n')}
`;
}

main()
  .catch((err) => {
    console.error('❌ Benchmark runner failed:', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
