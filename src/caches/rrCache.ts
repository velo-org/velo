import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';

//TODO: change override to delete but bad performance
export class RRCache extends BaseCache {
  private storage: { [key: string]: string | undefined };
  private freeKeys: string[];

  constructor(options: Options) {
    super(options);
    this.storage = {};
    this.freeKeys = [];
  }

  set<T>(key: string, value: T) {
    if (this.freeKeys.length > 0) {
      this.storage[this.freeKeys[0]] = this.storage[key];
      this.storage[key] = JSON.stringify(value);
      this.freeKeys.splice(0, 1);
      return;
    }
    if (this.storage[key]) {
      this.storage[key] = JSON.stringify(value);
      return;
    }
    if (
      this.maxCache !== 0 &&
      Object.keys(this.storage).length === this.maxCache
    ) {
      const prop = this.randomProperty();
      this.storage[prop] = this.storage[key];
    }
    this.storage[key] = JSON.stringify(value);
    console.log(this.storage);
  }
  private randomProperty() {
    const keys = Object.keys(this.storage);
    return keys[(keys.length * Math.random()) << 0];
  }
  get<T>(key: string): T {
    return JSON.parse(this.storage[key]!);
  }

  remove(key: string) {
    this.storage[key] = undefined;
    this.freeKeys.push('key');
  }

  forEach<T>(
    callback: (item: { key: string; value: T }, index: number) => void
  ) {
    let i = 0;
    Object.keys(this.storage).forEach((key) => {
      if (this.storage[key]) {
        callback.call(this, { key, value: JSON.parse(this.storage[key]!) }, i);
        i++;
      }
    });
  }

  get Storage() {
    return this.storage;
  }
}
