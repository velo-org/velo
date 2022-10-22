import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { RemoveCause } from "./remove_listener_capability.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export interface Expirable<V> {
  readonly value: V | undefined;
  isExpired(): boolean;
}

export class ExpireCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "expire";
  private ttl: number;
  private timeouts: Map<K, number>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, ttl: number) {
    super(inner);
    this.ttl = ttl;
    this.timeouts = new Map();
  }

  set(key: K, value: V): void {
    this.setWithExpire(key, value, this.ttl);
  }

  setWithExpire(key: K, value: V, ttl: number) {
    this.setTimeout(key, value, ttl);
    super.set(key, value);
  }

  private setTimeout(key: K, value: V, ttl: number) {
    if (this.timeouts.has(key)) {
      const id = this.timeouts.get(key);
      clearTimeout(id);
    }

    const id = setTimeout(() => {
      super.erase(key);
      if (this.onRemove) {
        this.onRemove(key, value, RemoveCause.Expired);
      }
      if (this.fireEvent) {
        this.fireEvent("expire", key, value);
      }
    }, ttl);

    this.timeouts.set(key, id);
  }
}
