export interface CacheStatistics {
  readonly hitCount: number;
  readonly missCount: number;
  readonly evictCount: number;
  readonly loadingCount: number;
  readonly loadingFailureCount: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly loadFailureRate: number;
}

export interface StatCounter {
  recordHit(): void;
  recordMiss(): void;
  recordLoadingSuccess(): void;
  recordLoadingFail(): void;
  recordEviction(): void;
  stats(): CacheStatistics;
}
