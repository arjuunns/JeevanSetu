import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const visit = await prisma.visit.findFirst({
      where: { id: 'cmqnrg2k800057miwjsclpld1' },
      include: {
        patient: true,
        assessment: {
          include: {
            citations: true,
          },
        },
        routing: {
          include: {
            selectedHospital: true,
          },
        },
      },
    });

    if (visit) {
      console.log(`Visit ID: ${visit.id}`);
      console.log(`Patient: ${visit.patient.name}`);
      console.log(`Visit Status: ${visit.status}`);
      if (visit.assessment) {
        console.log(`AI Severity: ${visit.assessment.aiSeverity}`);
        console.log(`Citations count: ${visit.assessment.citations.length}`);
      }
      if (visit.routing) {
        console.log(`Selected Hospital ID: ${visit.routing.selectedHospitalId}`);
        console.log(`Selected Hospital Name: ${visit.routing.selectedHospital?.name}`);
        console.log(`Ranked Candidates:`, JSON.stringify(visit.routing.rankedCandidates, null, 2));
      } else {
        console.log(`No routing record found for this visit.`);
      }
    } else {
      console.log('Visit not found.');
    }
  } catch (error) {
    console.error('Error querying DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
