import { Key } from './key.ts';

export interface Cache<V> {
  capacity: number;
  size: number;
  keys: Array<Key>;
  values: Array<V>;
  set(key: Key, value: V): void;
  get(key: Key): V | undefined;
  remove(key: Key): void;
  clear(): void;
  has(key: Key): boolean;
  peek(key: Key): V | undefined;
}
