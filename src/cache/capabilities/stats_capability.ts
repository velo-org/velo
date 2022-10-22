import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { StatCounter } from "./counter.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export interface CacheStatistics {
  readonly hitCount: number;
  readonly missCount: number;
  readonly hitRate: number;
}

/**
 * Add statistics collection to a cache. 
 */
export class StatisticsCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "stats";
  private counter: StatCounter;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, counter: StatCounter) {
    super(inner);
    this.counter = counter;
  }

  public get(key: K): V | undefined {
    const result = super.get(key);

    if (result === undefined) {
      this.counter.recordMiss();
    } else {
      this.counter.recordHit();
    }

    return result;
  }

  get stats(): CacheStatistics {
    return this.counter.stats();
  }
}
