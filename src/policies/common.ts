import { Policy } from "../models/policy.ts";

export abstract class BasePolicy<K, V> implements Policy<V, K> {
  readonly capacity: number;
  abstract readonly size: number;
  abstract readonly keys: K[];
  abstract readonly values: V[];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  abstract set(key: K, value: V): void;
  abstract get(key: K): V | undefined;
  abstract peek(key: K): V | undefined;
  abstract remove(key: K): void;
  abstract clear(): void;
  abstract has(key: K): boolean;
  abstract forEach(
    callback: (item: { key: K; value: V }, index: number) => void
  ): void;
  abstract [Symbol.iterator](): IterableIterator<{
    key: K;
    value: V | undefined;
  }>;
}
