import { Policy } from "../../policy/policy.ts";
import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { RemoveCause } from "./remove_listener_capability.ts";
import { CapabilityWrapper } from "./wrapper.ts";

/**
 * Adds a policy to the cache.
 */
export class PolicyCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "policy";
  private policy: Policy<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, policy: Policy<K, V>) {
    super(inner);
    this.policy = policy;
  }

  get(key: K): V | undefined {
    return this.policy.get(key);
  }

  set(key: K, value: V): void {
    const oldValue = this.policy.set(key, value);
    if (oldValue !== undefined && this.onRemove) {
      this.onRemove(key, oldValue, RemoveCause.Replaced);
    }
  }

  remove(key: K): void {
    const oldValue = this.policy.remove(key);
    if (oldValue !== undefined && this.onRemove) {
      this.onRemove(key, oldValue, RemoveCause.Explicit);
    }
  }

  erase(key: K): void {
    this.policy.remove(key);
  }

  take(key: K): V | undefined {
    const value = this.get(key);
    this.remove(key);
    return value;
  }

  peek(key: K): V | undefined {
    return this.policy.peek(key);
  }

  has(key: K): boolean {
    return this.policy.has(key);
  }

  clear(): void {
    this.policy.clear();
  }

  forEach(callback: (item: { key: K; value: V }, index?: number) => void): void {
    this.policy.forEach(callback);
  }

  get capacity(): number {
    return this.policy.capacity;
  }

  get size(): number {
    return this.policy.size;
  }

  get keys(): K[] {
    return this.policy.keys;
  }

  get values(): V[] {
    return this.policy.values;
  }
}
