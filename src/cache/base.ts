import { EventEmitter } from "../../deps.ts";
import { Key } from "./key.ts";
import { Cache } from "./cache.ts";
import { Options } from "../../mod.ts";
import { CacheStatistics } from "./capabilities/stats_capability.ts";

const NO_POLICY = "No policy has been set for this cache";
const NO_OPTIONS = "Options extraction is not enabled for this cache.";
const NO_STATS = "Statistics are not enabled for this cache.";
const NO_EVENTS = "Events are not enabled for this cache.";
const NO_EXPIRE = "Expiration is not enabled for this cache.";

export class BaseCache<K extends Key, V> implements Cache<K, V> {
  get(_key: K): V | undefined {
    throw new Error(NO_POLICY);
  }
  set(_key: K, _value: V): void {
    throw new Error(NO_POLICY);
  }
  peek(_key: K): V | undefined {
    throw new Error(NO_POLICY);
  }
  has(_key: K): boolean {
    throw new Error(NO_POLICY);
  }
  take(_key: K): V | undefined {
    throw new Error(NO_POLICY);
  }
  remove(_key: K): void {
    throw new Error(NO_POLICY);
  }
  clear(): void {
    throw new Error(NO_POLICY);
  }
  forEach(_callback: (item: { key: K; value: V }, index?: number | undefined) => void): void {
    throw new Error(NO_POLICY);
  }
  setWithExpire(_key: K, _value: V, _expire: number): void {
    throw new Error(NO_EXPIRE);
  }
  get capacity(): number {
    throw new Error(NO_POLICY);
  }
  get size(): number {
    throw new Error(NO_POLICY);
  }
  get keys(): K[] {
    throw new Error(NO_POLICY);
  }
  get values(): V[] {
    throw new Error(NO_POLICY);
  }
  get options(): Options<K, V> {
    throw new Error(NO_OPTIONS);
  }
  get stats(): CacheStatistics {
    throw new Error(NO_STATS);
  }
  get events(): EventEmitter {
    throw new Error(NO_EVENTS);
  }
}
