import { Key } from "../cache/key.ts";

export interface Policy<K extends Key, V> {
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

export interface Entry<K extends Key, V> {
  key: K;
  value: V;
}
