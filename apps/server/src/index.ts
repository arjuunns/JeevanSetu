import { createServer } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { disconnectPrisma } from './lib/prisma.js';
import { closeNeo4j, isNeo4jAvailable, withSession } from './modules/routing/neo4j.js';
import { syncAllHospitalsToGraph } from './modules/routing/routing.service.js';
import { attachRealtime } from './realtime/socket.js';

/**
 * Server entry point. Boots the HTTP server, attaches the realtime gateway,
 * connects Redis, and installs graceful-shutdown handlers (Phase 17).
 */
async function main(): Promise<void> {
  const app = createApp();
  const httpServer = createServer(app);
  attachRealtime(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `JeevanSetu API listening on http://localhost:${env.PORT}`,
    );
  });

  // Seeding and migrations write only to PostgreSQL, so a fresh stack (or a
  // wiped Neo4j volume) starts with an empty graph and every routing request
  // falls back. Backfill once, in the background — never block listen().
  void backfillGraphIfEmpty();

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutting down gracefully');
    httpServer.close(() => {
      void Promise.allSettled([disconnectPrisma(), closeNeo4j()]).then(() => {
        logger.info('Shutdown complete');
        process.exit(0);
      });
    });
    // Force-exit if connections do not drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled rejection'));
}

/** Populate the routing graph on boot if it holds no hospitals. */
async function backfillGraphIfEmpty(): Promise<void> {
  try {
    if (!(await isNeo4jAvailable())) return;
    const count = await withSession(async (session) => {
      const res = await session.run('MATCH (h:Hospital) RETURN count(h) AS c');
      return res.records[0]?.get('c')?.toNumber?.() ?? 0;
    });
    if (count > 0) return;
    const synced = await syncAllHospitalsToGraph();
    logger.info({ synced }, 'Routing graph was empty — backfilled hospitals from PostgreSQL');
  } catch (err) {
    // Routing still works via the PostgreSQL path, so this must never crash boot.
    logger.error({ err }, 'Failed to backfill routing graph');
  }
}

main().catch((err) => {
  logger.error({ err }, 'Fatal error during startup');
  process.exit(1);
});
