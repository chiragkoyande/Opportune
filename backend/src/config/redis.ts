// ============================================================
// OPPORTUNE V4 — Redis Client & Cache Manager
// Fail-open caching with graceful degradation when Redis is offline
// ============================================================

import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

class RedisCacheManager {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    if (env.REDIS_ENABLED) {
      try {
        this.client = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          retryStrategy: (times) => {
            if (times > 3) return null; // stop reconnecting if down
            return Math.min(times * 100, 1000);
          },
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          logger.info('Redis connected successfully');
        });

        this.client.on('error', (err) => {
          this.isConnected = false;
          logger.warn({ error: err.message }, 'Redis error, falling back to direct database execution');
        });
      } catch (err) {
        this.client = null;
        this.isConnected = false;
        logger.warn('Failed to initialize Redis client, continuing without cache');
      }
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  public async set(key: string, value: unknown, ttlSeconds = env.REDIS_CACHE_TTL_SECONDS): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Ignore cache write failure
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch {
      // Ignore
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const stream = this.client.scanStream({ match: pattern, count: 100 });
      stream.on('data', (keys: string[]) => {
        if (keys.length) {
          const pipeline = this.client!.pipeline();
          keys.forEach((k) => pipeline.del(k));
          pipeline.exec();
        }
      });
    } catch {
      // Ignore
    }
  }

  public async isHealthy(): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;
    try {
      const ping = await this.client.ping();
      return ping === 'PONG';
    } catch {
      return false;
    }
  }
}

export const cache = new RedisCacheManager();
