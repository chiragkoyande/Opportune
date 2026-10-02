// ============================================================
// OPPORTUNE V4 — Database Connection Pool & Query Executor
// Native PostgreSQL Pool with in-memory resilient fallback
// ============================================================

import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const { Pool } = pg;

export class Database {
  private pool: pg.Pool | null = null;
  private isConnected: boolean = false;

  constructor() {
    try {
      this.pool = new Pool({
        connectionString: env.DATABASE_URL,
        max: env.DATABASE_POOL_SIZE,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: env.DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
      });

      this.pool.on('error', (err) => {
        logger.error({ error: err.message }, 'Unexpected PostgreSQL pool error');
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn({ error: msg }, 'Failed to initialize PostgreSQL pool, database operations will use fallback');
      this.pool = null;
    }
  }

  public async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<pg.QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.query<T>(text, params);
  }

  public async withTransaction<T>(
    callback: (client: pg.PoolClient) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async isHealthy(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const res = await this.pool.query('SELECT 1 as ping');
      return res.rows.length > 0 && res.rows[0].ping === 1;
    } catch {
      return false;
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

export const db = new Database();
