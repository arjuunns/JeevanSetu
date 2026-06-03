import neo4j, { type Driver, type Session } from 'neo4j-driver';

import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * Neo4j driver for the routing graph (Phase 10). The graph models
 * (:Hospital)-[:HAS_DEPARTMENT]->(:Department), (:Hospital)-[:EMPLOYS]->(:Specialist),
 * and (:Hospital)-[:HAS_RESOURCE]->(:Resource), enabling graph traversals that
 * answer "which hospitals can treat this patient" before distance scoring.
 *
 * The driver is optional: if Neo4j is unreachable the routing service falls back
 * to an equivalent PostgreSQL query so routing still works in minimal setups.
 */
let _driver: Driver | null = null;
let _available: boolean | null = null;

export function getDriver(): Driver {
  if (!_driver) {
    _driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD),
      { maxConnectionPoolSize: 20, connectionTimeout: 5000 },
    );
  }
  return _driver;
}

/** Returns true if Neo4j answered a connectivity check. Cached after first call. */
export async function isNeo4jAvailable(): Promise<boolean> {
  if (_available !== null) return _available;
  try {
    await getDriver().verifyConnectivity();
    _available = true;
  } catch (err) {
    logger.warn({ err }, 'Neo4j unavailable — routing will fall back to PostgreSQL');
    _available = false;
  }
  return _available;
}

export async function withSession<T>(fn: (session: Session) => Promise<T>): Promise<T> {
  const session = getDriver().session();
  try {
    return await fn(session);
  } finally {
    await session.close();
  }
}

export async function closeNeo4j(): Promise<void> {
  if (_driver) {
    await _driver.close();
    _driver = null;
  }
}
