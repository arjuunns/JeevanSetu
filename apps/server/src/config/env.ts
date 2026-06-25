import { z } from 'zod';

/**
 * Environment validation (Phase 1). The server refuses to boot if required
 * configuration is missing or malformed, so misconfiguration fails fast and
 * loudly rather than at the first request.
 *
 * Integrations that require third-party credentials (Gemini, Pinecone, Neo4j,
 * Clerk, AWS, notifications) are optional at the schema level and individually
 * guarded at their call sites — this lets the core platform (intake, safety,
 * audit) run locally without every external account provisioned.
 */
const booleanish = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // AI stack (optional — triage degrades gracefully without it)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_TRIAGE_MODEL: z.string().default('gemini-2.0-flash'),
  // text-embedding-004 was retired by Google; gemini-embedding-001 vectors
  // are truncated to EMBEDDING_DIMENSION (1024) to match the Pinecone index.
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),

  // RAG
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().default('jeevansetu-guidelines'),

  // Routing graph
  NEO4J_URI: z.string().default('bolt://localhost:7687'),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default('jeevansetu'),

  // Auth
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET: z.string().default('jeevansetu-documents'),

  // Notifications
  RESEND_API_KEY: z.string().optional(),
  NOTIFICATION_FROM_EMAIL: z.string().default('alerts@jeevansetu.health'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().optional(),

  // Allow auth to be bypassed ONLY in local/dev for testing intake flows.
  AUTH_DISABLED: booleanish.default('false'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    // eslint-disable-next-line no-console
    console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

/** Feature flags derived from which credentials are present. */
export const features = {
  ai: Boolean(env.GEMINI_API_KEY),
  rag: Boolean(env.GEMINI_API_KEY && env.PINECONE_API_KEY),
  auth: Boolean(env.CLERK_SECRET_KEY) && !env.AUTH_DISABLED,
  storage: Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),
  email: Boolean(env.RESEND_API_KEY),
  sms: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
} as const;
