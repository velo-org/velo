export interface CacheStatistics {
  readonly hitCount: number;
  readonly missCount: number;
  readonly hitRate: number;
}

export interface StatCounter {
  recordHit(): void;
  recordMiss(): void;
  stats(): CacheStatistics;
}
