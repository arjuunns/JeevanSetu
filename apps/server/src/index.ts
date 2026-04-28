import { createServer } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { disconnectPrisma } from './lib/prisma.js';
import { connectRedis, redis } from './lib/redis.js';
import { closeNeo4j } from './modules/routing/neo4j.js';
import { attachRealtime } from './realtime/socket.js';

/**
 * Server entry point. Boots the HTTP server, attaches the realtime gateway,
 * connects Redis, and installs graceful-shutdown handlers (Phase 17).
 */
async function main(): Promise<void> {
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);
  attachRealtime(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `JeevanSetu API listening on http://localhost:${env.PORT}`,
    );
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutting down gracefully');
    httpServer.close(() => {
      void Promise.allSettled([disconnectPrisma(), redis.quit(), closeNeo4j()]).then(() => {
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

main().catch((err) => {
  logger.error({ err }, 'Fatal error during startup');
  process.exit(1);
});
