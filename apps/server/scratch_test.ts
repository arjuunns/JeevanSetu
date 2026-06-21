import { PrismaClient } from '@prisma/client';
import { createFullIntake } from './src/modules/patients/patient.service.js';

const prisma = new PrismaClient();

async function main() {
  try {
    // Retrieve a SUPER_ADMIN to act as the user
    const user = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!user) {
      console.error('No SUPER_ADMIN user found in database. Run db:seed first.');
      return;
    }

    const testPayload = {
      patient: {
        name: 'Test Patient From Scratch',
        age: 30,
        gender: 'MALE' as const,
        phone: '+919876543210',
        bloodGroup: 'A_POSITIVE' as const,
        allergies: [],
        existingDiseases: [],
        medications: [],
      },
      vitals: {
        temperatureC: 37,
        oxygenSaturation: 98,
        heartRate: 72,
        respiratoryRate: 16,
        systolicBp: 120,
        diastolicBp: 80,
        glasgowComaScale: 15,
        isUnconscious: false,
      },
      symptoms: {
        primarySymptom: {
          name: 'Mild Cough',
          severity: 'MILD' as const,
          isPrimary: true,
          duration: '2 days',
        },
        secondarySymptoms: [],
      },
      chiefComplaint: 'Coughing for 2 days',
    };

    console.log('Invoking createFullIntake...');
    const result = await createFullIntake(testPayload, {
      userId: user.id,
      ipAddress: '127.0.0.1',
      userAgent: 'scratch-client',
      requestId: 'test-req',
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error invoking createFullIntake:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
