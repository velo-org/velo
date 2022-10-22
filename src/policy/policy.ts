import { Key } from "../cache/key.ts";
import { RemoveListener } from "../cache/capabilities/remove_listener_capability.ts";

export interface Policy<K extends Key, V> {
  readonly capacity: number;
  readonly size: number;
  readonly keys: K[];
  readonly values: V[];
  onEvict?: RemoveListener<K, V>;
  set(key: K, value: V): V | undefined;
  get(key: K): V | undefined;
  peek(key: K): V | undefined;
  remove(key: K): V | undefined;
  clear(): void;
  has(key: K): boolean;
  forEach(callback: (item: { key: K; value: V }, index: number) => void): void;
}

export interface Entry<K extends Key, V> {
  key: K;
  value: V;
}
