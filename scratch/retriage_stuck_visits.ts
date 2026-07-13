import { PrismaClient } from '@prisma/client';
import { runVisitPipeline } from '../apps/server/src/modules/agents/orchestrator.js';

const prisma = new PrismaClient();

async function main() {
  console.log("Searching for stuck visits...");
  
  const stuckVisits = await prisma.visit.findMany({
    where: {
      deletedAt: null,
      triageAssessment: null,
    },
    include: {
      patient: true,
    }
  });

  console.log(`Found ${stuckVisits.length} stuck visits.`);

  for (const visit of stuckVisits) {
    console.log(`Retriaging visit ID: ${visit.id} for patient: ${visit.patient.name}...`);
    try {
      const result = await runVisitPipeline(
        visit.id,
        {},
        { userId: 'system-retriage', userRole: 'SYSTEM', hospitalId: null }
      );
      console.log(`Successfully triaged visit ${visit.id}. Status:`, result.steps.map(s => `${s.agent}: ${s.status}`));
    } catch (error) {
      console.error(`Failed to triage visit ${visit.id}:`, error);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
