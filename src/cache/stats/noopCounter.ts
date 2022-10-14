import { CacheStatistics, StatCounter } from "../../models/stats.ts";

export class NoopCounter implements StatCounter {
  recordHit(): void {}

  recordMiss(): void {}

  recordLoadingSuccess(): void {}

  recordLoadingFail(): void {}

  recordEviction(): void {}

  stats(): CacheStatistics {
    return {
      hitCount: 0,
      missCount: 0,
      evictCount: 0,
      loadSuccessCount: 0,
      loadFailCount: 0,
      hitRate: 0,
      missRate: 0,
      loadFailureRate: 0,
    };
  }
}
