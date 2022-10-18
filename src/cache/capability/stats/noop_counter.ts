import { CacheStatistics, StatCounter } from "./stats.ts";

export class NoopCounter implements StatCounter {
  recordHit(): void {}
  recordMiss(): void {}

  stats(): CacheStatistics {
    return {
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
    };
  }
}
