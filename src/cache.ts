import { LRUCache } from "./models/LRUCache.ts";
import { Options } from "./models/Options.ts";

export default class Cache {
  private storage: LRUCache[];
  private options: Options;

  constructor(options: Options = { maxCache: 0 }) {
    this.storage = [];
    this.options = options;
  }

  set(key: string, value: any) {
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

  get(key: string) {
    const item = this.storage.splice(
      this.storage.findIndex((st) => st.key === key),
      1
    )[0];
    item.used = Date.now();
    this.storage.unshift(item);
    return JSON.parse(item.value);
  }
  get Storage() {
    return this.storage;
  }
}
