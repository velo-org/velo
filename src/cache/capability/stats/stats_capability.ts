import { Cache } from "../../cache.ts";
import { Key } from "../../key.ts";
import { CapabilityRecord } from "../record.ts";
import { CapabilityWrapper } from "../wrapper.ts";
import { CacheStatistics, StatCounter } from "./stats.ts";


export class StatisticsCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "stats";
  private counter: StatCounter;

  constructor(inner: Cache<K, V>, counter: StatCounter) {
    super(inner);
    this.counter = counter;
  }

  initCapability(_record: CapabilityRecord<K, V>): void {}

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
