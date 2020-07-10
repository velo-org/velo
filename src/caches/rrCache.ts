import { BaseCache } from './baseCache.ts';
import { RRStorage } from '../models/rrStorage.ts';
import { Options } from '../models/options.ts';

export class RRCache extends BaseCache<RRStorage> {
  constructor(options: Options) {
    super(options);
  }

  set<T>(key: string, value: T) {
    if (
      this.options.maxCache !== 0 &&
      this.storage.length == this.options.maxCache
    ) {
      this.storage.splice(Math.random() * this.storage.length, 1);
    }
    this.storage.push({
      key,
      value: JSON.stringify(value),
    });
  }

  get<T>(key: string): T {
    const hit = this.storage.find((st) => st.key === key)?.value;
    return hit ? JSON.parse(hit) : undefined;
  }
}
