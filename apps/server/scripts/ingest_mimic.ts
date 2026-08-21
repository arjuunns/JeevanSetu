import './load-env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient, VisitStatus, Gender, BloodGroup, SymptomSeverity } from '@prisma/client';
import { runSafetyScreen, type SafetyInput } from '../src/modules/safety/safety.engine.js';

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

async function main(): Promise<void> {
  console.log('🏥 Starting MIMIC-IV-ED Benchmark Ingestion into JeevanSetu PostgreSQL Database...');

  const dataPath = path.resolve(__dirname, '../../../data/mimic_benchmark_150.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Benchmark dataset not found at ${dataPath}. Run the extraction script first.`);
    process.exit(1);
  }

  const cases: BenchmarkCase[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📋 Loaded ${cases.length} validated de-identified clinical cases.`);

  // Ensure default staff user exists for foreign key references
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

  let insertedCount = 0;
  let safetyCriticalCount = 0;

  for (const c of cases) {
    const mrn = `MIMIC-${c.subjectId}-${c.stayId}`;

    // Safety Screen Check
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
      symptoms: c.symptoms.map((s) => ({ name: s.name, severity: s.severity as SymptomSeverity })),
    };
    const safety = runSafetyScreen(safetyInput, new Date().toISOString());
    if (safety.isCritical) safetyCriticalCount++;

    // Upsert Patient & Visit
    const existingPatient = await prisma.patient.findUnique({ where: { mrn } });

    if (existingPatient) {
      // Clean up previous visits for clean re-ingestion
      await prisma.visit.deleteMany({ where: { patientId: existingPatient.id } });
      await prisma.patient.delete({ where: { id: existingPatient.id } });
    }

    await prisma.patient.create({
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
            notes: `Confirmed MIMIC-IV ED Diagnosis (Acuity: ESI ${c.groundTruthEsi})`,
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
                duration: 'Acute ED Presentation',
              })),
            },
          },
        },
      },
    });

    insertedCount++;
    if (insertedCount % 25 === 0 || insertedCount === cases.length) {
      console.log(`  ✓ Ingested ${insertedCount}/${cases.length} patients...`);
    }
  }

  console.log('\n===============================================================');
  console.log(`✅ Ingestion Complete!`);
  console.log(`• Total MIMIC-IV-ED Patients Ingested: ${insertedCount}`);
  console.log(`• Deterministic Safety Critical Red Flags Triggered: ${safetyCriticalCount}`);
  console.log('===============================================================\n');
}

main()
  .catch((err) => {
    console.error('❌ Ingestion failed:', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
