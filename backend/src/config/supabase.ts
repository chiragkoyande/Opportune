// ============================================================
// OPPORTUNE V4 — Supabase Client Setup
// Supabase connection for Auth & Storage verification
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from './logger.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY)) {
  const key = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
  supabaseClient = createClient(env.SUPABASE_URL, key, {
    auth: { persistSession: false },
  });

  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  logger.info({ supabaseUrl: env.SUPABASE_URL }, 'Supabase client initialized');
} else {
  logger.warn('Supabase credentials not fully provided; running in local/fallback auth mode');
}

export { supabaseClient, supabaseAdminClient };
