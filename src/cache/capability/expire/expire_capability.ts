import { Cache } from "../../cache.ts";
import { Key } from "../../key.ts";
import { EventCapability } from "../events/event_capability.ts";
import { CapabilityRecord } from "../record.ts";
import { CapabilityWrapper } from "../wrapper.ts";

export class ExpireCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  private ttl: number;
  private timeouts: Map<K, number>;
  private onTimeout: ((key: K, value: V) => void) | null;

  constructor(inner: Cache<K, V>, ttl: number) {
    super(inner);
    this.ttl = ttl;
    this.timeouts = new Map();
    this.onTimeout = null;
  }

  initCapability(record: CapabilityRecord<K, V>): void {
    const events = record.get("events") as EventCapability<K, V>;
    if (events) {
      this.onTimeout = (key, value) => {
        events.fireEvent("expire", key, value);
      };
    }
  }

  set(key: K, value: V): void {
    this.setTTL(key, value);
    super.set(key, value);
  }

  private setTTL(key: K, value: V) {
    if (this.timeouts.has(key)) {
      const id = this.timeouts.get(key);
      clearTimeout(id);
    }

    const id = setTimeout(() => {
      super.remove(key);
      if (this.onTimeout) {
        this.onTimeout(key, value);
      }
    }, this.ttl);

    this.timeouts.set(key, id);
  }
}
