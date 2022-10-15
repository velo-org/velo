import { WindowTinyLfu } from "../../mod.ts";
import { ARC } from "../policy/arc.ts";
import { LFU } from "../policy/lfu.ts";
import { LRU } from "../policy/lru.ts";
import { SC } from "../policy/sc.ts";
import { Key } from "./cache.ts";
import { StatCounter } from "./stats.ts";

/**
 * A cache replacement policy
 */
export interface Policy<K, V> {
  readonly capacity: number;
  readonly size: number;
  readonly keys: K[];
  readonly values: V[];
  statCounter: StatCounter;
  set(key: K, value: V): void;
  get(key: K): V | undefined;
  peek(key: K): V | undefined;
  remove(key: K): void;
  clear(): void;
  has(key: K): boolean;
  forEach(callback: (item: { key: K; value: V }, index: number) => void): void;
  [Symbol.iterator](): IterableIterator<{ key: K; value: V }>;
}

export function updateCapacity<K extends Key, V>(
  policy: Policy<K, V>,
  capacity: number
): Policy<K, V> {
  switch (policy.constructor.name) {
    case "LRU":
      return new LRU<K, V>(capacity);
    case "LFU":
      return new LFU<K, V>(capacity);
    case "ARC":
      return new ARC<K, V>(capacity);
    case "SC":
      return new SC<K, V>(capacity);
    case "WindowTinyLfu":
      return new WindowTinyLfu<K, V>(capacity);
    default:
      throw new Error("Unsupported policy");
  }
}
