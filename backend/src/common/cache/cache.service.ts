import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

export const TTL = {
  /** 2 minutes — fast-changing counts (student/staff totals) */
  SHORT: 120_000,
  /** 5 minutes — dashboard aggregations */
  DASHBOARD: 300_000,
  /** 30 minutes — slow-changing lists (classes, subjects) */
  LONG: 1_800_000,
  /** 60 minutes — config-like data (fee structures, school settings) */
  CONFIG: 3_600_000,
} as const;

// Minimal interface matching cache-manager v5 — avoids isolatedModules issues
// with the external `Cache` type in a decorated constructor signature.
interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

@Injectable()
export class AppCacheService {
  private readonly store: CacheStore;

  constructor(@Inject(CACHE_MANAGER) cacheManager: any) {
    this.store = cacheManager as CacheStore;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get<T>(key);
  }

  async set(key: string, value: unknown, ttlMs: number): Promise<void> {
    await this.store.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.store.del(key);
  }

  /**
   * Return cached value if present, otherwise call factory, cache the result, and return it.
   * ttlMs is in milliseconds (cache-manager v5 / redis-yet uses ms).
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = await this.store.get<T>(key);
    if (cached !== undefined && cached !== null) return cached;
    const value = await factory();
    await this.store.set(key, value, ttlMs);
    return value;
  }
}
