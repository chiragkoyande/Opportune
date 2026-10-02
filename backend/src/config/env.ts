// ============================================================
// OPPORTUNE V4 — Environment Configuration
// Zod-validated configuration with strict defaults
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend or root directory if present
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),
  API_V1_PREFIX: z.string().default('/api/v1'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000'),

  // Database (PostgreSQL / Supabase)
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/opportune_v4'),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_ENABLED: z.preprocess((val) => val === 'true' || val === true || val === '1', z.boolean()).default(false),
  REDIS_CACHE_TTL_SECONDS: z.coerce.number().default(3600),

  // Supabase Auth & Storage
  SUPABASE_URL: z.string().default('https://bamhgnsilycmlvzmvbth.supabase.co'),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Crawler & Scheduler
  CRAWLER_CONCURRENCY: z.coerce.number().default(5),
  CRAWLER_PER_DOMAIN_DELAY_MS: z.coerce.number().default(1500),
  CRAWLER_CRON: z.string().default('0 0 * * *'), // 00:00 IST nightly
  CRAWLER_TIMEZONE: z.string().default('Asia/Kolkata'),
  CRAWLER_USER_AGENT: z.string().default('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (OpportuneBot/4.0)'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;

export const allowedOriginsList = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
