import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { FireEventFunction } from "./event_capability.ts";
import { RemoveListener } from "./remove_listener_capability.ts";

export abstract class CapabilityWrapper<K extends Key, V> implements Cache<K, V>, CacheInternal<K, V> {
  public static ID: string;
  private inner: Cache<K, V> & CacheInternal<K, V>;
  onRemove?: RemoveListener<K, V>;
  fireEvent?: FireEventFunction<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>) {
    this.inner = inner;
    this.onRemove = inner.onRemove;
    this.fireEvent = inner.fireEvent;
  }

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
  setWithExpire(key: K, value: V, expire: number): void {
    return this.inner.setWithExpire(key, value, expire);
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

  erase(key: K): void {
    return this.inner.erase(key);
  }
}
