import { CacheStatistics } from "./stats_capability.ts";

export interface StatCounter {
  recordHit(): void;
  recordMiss(): void;
  stats(): CacheStatistics;
}

export class Counter implements StatCounter {
  private _hits: number;
  private _misses: number;

  constructor() {
    this._hits = 0;
    this._misses = 0;
  }

  recordHit() {
    this._hits++;
  }

  recordMiss() {
    this._misses++;
  }

  stats() {
    return {
      hitCount: this._hits,
      missCount: this._misses,
      hitRate: this._hits / (this._hits + this._misses),
    };
  }
}
