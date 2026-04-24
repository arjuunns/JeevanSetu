import { PrismaClient, UserRole, Gender, BloodGroup, SeverityLevel, SymptomSeverity, VisitStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate a random number within a range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main(): Promise<void> {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Ensure users exist
  const roles = [
    { clerkUserId: 'dev_nurse', email: 'nurse@jeevansetu.health', role: 'NURSE' as const, firstName: 'Asha', lastName: 'Nurse' },
    { clerkUserId: 'dev_doctor', email: 'doctor@jeevansetu.health', role: 'DOCTOR' as const, firstName: 'Ravi', lastName: 'Doctor' },
    { clerkUserId: 'dev_admin', email: 'admin@jeevansetu.health', role: 'HOSPITAL_ADMIN' as const, firstName: 'Meera', lastName: 'Admin' },
    { clerkUserId: 'dev_cmo', email: 'cmo@jeevansetu.health', role: 'CMO' as const, firstName: 'Sanjay', lastName: 'CMO' },
    { clerkUserId: 'dev_super', email: 'super@jeevansetu.health', role: 'SUPER_ADMIN' as const, firstName: 'Root', lastName: 'Admin' },
  ];
  for (const u of roles) {
    await prisma.user.upsert({ where: { clerkUserId: u.clerkUserId }, create: u, update: u });
  }
  const devDoctor = await prisma.user.findUniqueOrThrow({ where: { clerkUserId: 'dev_doctor' } });

  // 2. Generate 25 Hospitals in Chandigarh-Mohali-Panchkula region
  console.log('Provisioning 25 hospitals...');
  const cities = ['Chandigarh', 'Mohali', 'Panchkula'];
  const states: Record<string, string> = { Chandigarh: 'Chandigarh', Mohali: 'Punjab', Panchkula: 'Haryana' };
  const emergencyTiers = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'COMPREHENSIVE'] as const;
  const specialtiesPool = ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Trauma', 'Pulmonology'];
  const resourcesPool = ['CT Scanner', 'Cath Lab', 'MRI', 'Dialysis', 'X-Ray', 'Ultrasound', 'ICU Ventilator'];

  for (let i = 1; i <= 25; i++) {
    const cityName = randomElement(cities);
    const stateName = states[cityName];
    const tier = randomElement(emergencyTiers);
    const isTrauma = tier === 'COMPREHENSIVE' || (tier === 'ADVANCED' && Math.random() > 0.4);

    const lat = randomRange(30.6800, 30.7700);
    const lng = randomRange(76.6900, 76.8500);

    const name = `Sector ${randomInt(1, 70)} ${randomElement(['Fortis', 'Max', 'Apollo', 'Civil', 'General', 'Medicity', 'Care'])} Hospital`;

    const icuTotal = randomInt(5, 50);
    const genTotal = randomInt(50, 400);
    const ventTotal = randomInt(2, 35);
    const ambTotal = randomInt(2, 15);

    await prisma.hospital.create({
      data: {
        name,
        address: `Sector ${randomInt(1, 70)}, ${cityName}`,
        city: cityName,
        state: stateName,
        latitude: lat,
        longitude: lng,
        phone: `+919815${randomInt(100000, 999999)}`,
        email: `contact@hosp${i}.jeevansetu.health`,
        emergencyLevel: tier,
        isTraumaCenter: isTrauma,
        capacity: {
          create: {
            icuBedsTotal: icuTotal,
            icuBedsAvailable: randomInt(0, icuTotal),
            generalBedsTotal: genTotal,
            generalBedsAvailable: randomInt(10, genTotal),
            ventilatorsTotal: ventTotal,
            ventilatorsAvailable: randomInt(0, ventTotal),
            ambulancesTotal: ambTotal,
            ambulancesAvailable: randomInt(1, ambTotal),
          }
        },
        departments: {
          create: specialtiesPool.filter(() => Math.random() > 0.3).map(name => ({ name }))
        },
        specialists: {
          create: [
            { name: `Dr. Amit Sharma ${i}`, specialty: 'General Medicine', isOnDuty: true },
            { name: `Dr. Sarah Verma ${i}`, specialty: 'Emergency', isOnDuty: Math.random() > 0.3 }
          ]
        },
        resources: {
          create: resourcesPool.filter(() => Math.random() > 0.4).map(name => ({ name, category: 'Equipment' }))
        }
      }
    });
  }

  // 3. Generate 70 Patients with diverse Clinical Cases (Critical, High, Moderate, Low)
  console.log('Provisioning 70 patients and visits...');
  const firstNames = ['Arjun', 'Vikram', 'Priya', 'Anjali', 'Rahul', 'Aditya', 'Neha', 'Kabir', 'Rohan', 'Sneha', 'Deepak', 'Aarav', 'Simran', 'Ishaan', 'Meera', 'Riya', 'Karan', 'Pooja', 'Sunita', 'Rajesh'];
  const lastNames = ['Sharma', 'Verma', 'Mehta', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Nair', 'Kumar', 'Joshi', 'Chawla', 'Soni', 'Gill', 'Kapoor', 'Das', 'Roy', 'Sen', 'Rao', 'Bose', 'Deshmukh'];
  const genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
  const bloodGroups: BloodGroup[] = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];

  const clinicalCases = [
    // CRITICAL Cases (Deterministic Red Flags)
    {
      chiefComplaint: 'Chest pain and extreme breathlessness for 30 minutes',
      vitals: { oxygenSaturation: 89, heartRate: 115, systolicBp: 90, diastolicBp: 55, respiratoryRate: 28, temperatureC: 37.0 },
      symptoms: [
        { name: 'Crushing chest pain radiating to left arm', severity: 'SEVERE' as const, isPrimary: true },
        { name: 'Shortness of breath', severity: 'SEVERE' as const }
      ]
    },
    {
      chiefComplaint: 'Sudden weakness on right side of body and slurred speech',
      vitals: { oxygenSaturation: 97, heartRate: 85, systolicBp: 175, diastolicBp: 105, respiratoryRate: 18, temperatureC: 36.8 },
      symptoms: [
        { name: 'Right sided facial droop and arm weakness (FAST)', severity: 'SEVERE' as const, isPrimary: true },
        { name: 'Slurred speech', severity: 'SEVERE' as const }
      ]
    },
    {
      chiefComplaint: 'Patient found unconscious after falling from height',
      vitals: { oxygenSaturation: 91, heartRate: 125, systolicBp: 85, diastolicBp: 50, respiratoryRate: 26, temperatureC: 36.5, glasgowComaScale: 7, isUnconscious: true },
      symptoms: [
        { name: 'Loss of consciousness', severity: 'SEVERE' as const, isPrimary: true },
        { name: 'Bleeding from scalp', severity: 'SEVERE' as const }
      ]
    },
    // HIGH Severity Cases
    {
      chiefComplaint: 'High grade fever with severe cough and chills',
      vitals: { oxygenSaturation: 94, heartRate: 98, systolicBp: 110, diastolicBp: 70, respiratoryRate: 22, temperatureC: 39.5 },
      symptoms: [
        { name: 'High fever', severity: 'SEVERE' as const, isPrimary: true },
        { name: 'Productive cough', severity: 'MODERATE' as const }
      ]
    },
    {
      chiefComplaint: 'Severe abdominal pain in the right lower quadrant with vomiting',
      vitals: { oxygenSaturation: 98, heartRate: 94, systolicBp: 120, diastolicBp: 80, respiratoryRate: 20, temperatureC: 38.2 },
      symptoms: [
        { name: 'Right lower quadrant abdominal tenderness', severity: 'SEVERE' as const, isPrimary: true },
        { name: 'Nausea and vomiting', severity: 'MODERATE' as const }
      ]
    },
    // MODERATE/LOW Severity Cases
    {
      chiefComplaint: 'Loose stools and vomiting for the past 2 days',
      vitals: { oxygenSaturation: 98, heartRate: 88, systolicBp: 105, diastolicBp: 65, respiratoryRate: 16, temperatureC: 37.5 },
      symptoms: [
        { name: 'Loose watery stools', severity: 'MODERATE' as const, isPrimary: true },
        { name: 'Mild dehydration', severity: 'MILD' as const }
      ]
    },
    {
      chiefComplaint: 'Mild dry cough and throat irritation',
      vitals: { oxygenSaturation: 99, heartRate: 72, systolicBp: 120, diastolicBp: 80, respiratoryRate: 14, temperatureC: 36.6 },
      symptoms: [
        { name: 'Dry cough', severity: 'MILD' as const, isPrimary: true },
        { name: 'Sore throat', severity: 'MILD' as const }
      ]
    }
  ];

  for (let i = 1; i <= 70; i++) {
    const patientName = `${randomElement(firstNames)} ${randomElement(lastNames)}`;
    const age = randomInt(5, 85);
    const gender = randomElement(genders);
    const bloodGroup = randomElement(bloodGroups);
    const phone = `+919988${randomInt(100000, 999999)}`;

    // Pick a clinical scenario
    const scenario = randomElement(clinicalCases);

    await prisma.patient.create({
      data: {
        name: patientName,
        age,
        gender,
        bloodGroup,
        phone,
        existingDiseases: Math.random() > 0.6 ? ['Hypertension', 'Asthma'] : [],
        medications: Math.random() > 0.6 ? ['Amlodipine'] : [],
        registeredById: devDoctor.id,
        visits: {
          create: {
            chiefComplaint: scenario.chiefComplaint,
            status: 'REGISTERED' as VisitStatus,
            vitals: {
              create: scenario.vitals
            },
            symptoms: {
              create: scenario.symptoms.map(s => ({
                name: s.name,
                severity: s.severity,
                isPrimary: s.isPrimary ?? false,
                duration: '1 day'
              }))
            }
          }
        }
      }
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
