import { WindowTinyLfu } from "../../mod.ts";
import { Key } from "../cache/key.ts";
import { ARC } from "../policy/arc.ts";
import { LFU } from "../policy/lfu.ts";
import { LRU } from "../policy/lru.ts";
import { SC } from "../policy/sc.ts";

/**
 * A cache replacement policy
 */
export interface Policy<K, V> {
  readonly capacity: number;
  readonly size: number;
  readonly keys: K[];
  readonly values: V[];
  set(key: K, value: V): void;
  get(key: K): V | undefined;
  peek(key: K): V | undefined;
  remove(key: K): void;
  clear(): void;
  has(key: K): boolean;
  forEach(callback: (item: { key: K; value: V }, index: number) => void): void;
}
