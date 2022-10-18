import { Cache } from "../../cache.ts";
import { Key } from "../../key.ts";
import { CapabilityWrapper } from "../wrapper.ts";

export const EXPIRE_ID = "ttl";

export class ExpireCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  private ttl: number;
  private timeouts: Map<K, number>;

  constructor(inner: Cache<K, V>, ttl: number) {
    super(EXPIRE_ID, inner);
    this.ttl = ttl;
    this.timeouts = new Map();
  }

  set(key: K, value: V): void {
    this.setTTL(key);
    super.set(key, value);
  }

  private setTTL(key: K) {
    if (this.timeouts.has(key)) {
      const id = this.timeouts.get(key);
      clearTimeout(id);
    }

    const id = setTimeout(() => {
      super.remove(key);
    }, this.ttl);

    this.timeouts.set(key, id);
  }
}
