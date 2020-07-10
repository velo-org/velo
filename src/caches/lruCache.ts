import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { LRUStorage } from '../models/lruStorage.ts';

//TODO: replacement for unshift (push O(1) operation unshift O(n) operation no good performance)

export class LRUCache extends BaseCache<LRUStorage> {
  constructor(options: Options) {
    super(options);
  }

  set<T>(key: string, value: T) {
    if (
      this.options.maxCache !== 0 &&
      this.storage.length == this.options.maxCache
    ) {
      this.storage.pop();
    }
    this.storage.unshift({
      key,
      value: JSON.stringify(value),
      used: Date.now(),
    });
  }

  get<T>(key: string): T | undefined {
    const idx = this.storage.findIndex((st) => st.key === key);

    if (idx === -1) {
      return undefined;
    }

    const item = this.storage.splice(idx, 1)[0];
    item.used = Date.now();
    this.storage.unshift(item);
    return JSON.parse(item.value);
  }
}
