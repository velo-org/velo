import { Cache } from "../../cache.ts";
import { Key } from "../../key.ts";
import { CapabilityWrapper } from "../wrapper.ts";
import { CacheStatistics, StatCounter } from "./stats.ts";

export const STATS_ID = "stats";

export class StatisticsCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  private counter: StatCounter;

  constructor(inner: Cache<K, V>, counter: StatCounter) {
    super(STATS_ID, inner);
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
