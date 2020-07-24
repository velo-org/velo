import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';

export abstract class BaseCache<V> {
  readonly capacity: number;

  constructor(options: Options) {
    this.capacity = options.capacity;
  }

  abstract remove(key: Key): void;
  abstract get(key: Key): V | undefined;

  take(key: Key) {
    const value = this.get(key);
    this.remove(key);
    return value;
  }
}
