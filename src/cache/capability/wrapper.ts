import { Cache } from "../cache.ts";
import { Key } from "../key.ts";
import { CapabilityRecord } from "./record.ts";

export abstract class CapabilityWrapper<K extends Key, V> implements Cache<K, V> {
  public static ID: string;
  private inner: Cache<K, V>;

  constructor(inner: Cache<K, V>) {
    this.inner = inner;
  }

  abstract initCapability(record: CapabilityRecord<K, V>): void;

  get capacity() {
    return this.inner.capacity;
  }
  get size() {
    return this.inner.size;
  }
  get keys() {
    return this.inner.keys;
  }
  get values() {
    return this.inner.values;
  }
  get stats() {
    return this.inner.stats;
  }
  get events() {
    return this.inner.events;
  }
  get options() {
    return this.inner.options;
  }
  get(key: K): V | undefined {
    return this.inner.get(key);
  }
  set(key: K, value: V): void {
    return this.inner.set(key, value);
  }
  peek(key: K): V | undefined {
    return this.inner.peek(key);
  }
  has(key: K): boolean {
    return this.inner.has(key);
  }
  remove(key: K): void {
    return this.inner.remove(key);
  }
  clear(): void {
    return this.inner.clear();
  }
  take(key: K): V | undefined {
    return this.inner.take(key);
  }
  forEach(callback: (item: { key: K; value: V }, index?: number) => void): void {
    return this.inner.forEach(callback);
  }
}
