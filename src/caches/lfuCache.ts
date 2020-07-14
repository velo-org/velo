import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { quickSort } from '../utils/quickSort.ts';

type keyType = string | number;

export class LFUCache<V = any> extends BaseCache {
  storage: { key: keyType; value: V; accessed: number }[];
  items: { [key in keyType]: number };
  size: number;

  constructor(options: Options) {
    super(options);
    this.storage = new Array(this.maxCache);
    this.items = {};
    this.size = 0;
  }

  set(key: keyType, value: V) {
    let pointer = this.items[key];
    if (pointer) {
      this.storage[pointer].value = value;
      this.storage[pointer].accessed++;
      quickSort(this.storage, 0, this.storage.length - 1);
      return;
    }

    if (this.size < this.maxCache) {
      pointer = this.size++;
    } else {
      pointer = this.size - 1;
      delete this.items[this.storage[pointer].key];
    }
    this.storage[pointer] = { key, value, accessed: 0 };
    this.items[key] = pointer;
  }
  get(key: keyType) {
    let pointer = this.items[key];
    console.log(this.items);
    console.log(pointer);
    this.storage[pointer].accessed++;
    quickSort(this.storage, 0, this.storage.length - 1);
    return this.storage[pointer].value;
  }
  forEach(callback: (item: { key: keyType; value: V }, index: number) => void) {
    this.storage.forEach((val, i) => {
      callback.call(this, { key: val.key, value: val.value }, i);
    });
  }
}
