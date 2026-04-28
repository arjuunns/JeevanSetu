import { Redis } from 'ioredis';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Redis client used for caching, rate limiting, and pub/sub fan-out to the
 * realtime WebSocket layer. Lazy-connects so the server can boot before Redis
 * is reachable.
 */
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('error', (err) => logger.warn({ err }, 'Redis error'));
redis.on('connect', () => logger.info('Redis connected'));

/** A separate connection for pub/sub subscriptions (cannot share with commands). */
export const redisSub = redis.duplicate({ lazyConnect: true });

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (err) {
    logger.warn({ err }, 'Redis unavailable at startup — continuing without cache');
  }
}
