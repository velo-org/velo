import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { TypedArray } from '../utils/typedArray.ts';

//TODO: evict no good performance :(
type keyType = number | string;
export class RRCache<V = any> extends BaseCache {
  private storage: { [key in keyType]: V | undefined };
  keys: (keyType | undefined)[];
  freeMemory: number;
  counter: number;
  randomArr: Float64Array | Uint8Array | Uint16Array | Uint32Array;

  constructor(options: Options) {
    super(options);
    this.storage = {};
    this.keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    const PointerArray = TypedArray.getPointerArray(options.maxCache);
    this.randomArr = new PointerArray(options.maxCache);
    for (var i = this.maxCache; i > 0; i--) {
      this.randomArr[i] = (this.maxCache * Math.random()) | 0;
    }
  }

  set(key: keyType, value: V) {
    if (this.storage[key]) {
      this.storage[key] = value;
      return;
    }
    if (this.keys.length >= this.maxCache) {
      const prop = this.randomProperty()!;
      this.storage[key] =
        this.storage[prop] && (delete this.storage[prop] as any);
    }
    if (this.freeMemory !== -1 && this.keys.length >= this.maxCache) {
      this.keys[this.freeMemory] = key;
      this.freeMemory = -1;
    } else {
      this.keys.push(key);
    }
    this.storage[key] = value;
  }
  private randomProperty() {
    let num = this.randomArr[this.counter];
    this.counter++;
    if (this.counter >= this.maxCache) this.counter = 0;
    if (this.freeMemory === num) num += 1;
    const key = this.keys[num];
    this.keys[num] = undefined;
    this.freeMemory = num;

    return key;
  }
  get(key: string): V {
    return this.storage[key]!;
  }

  remove(key: keyType) {
    this.keys.splice(this.keys.indexOf(key), 1);
    delete this.storage[key];
  }

  forEach(callback: (item: { key: keyType; value: V }, index: number) => void) {
    let i = 0;
    Object.keys(this.storage).forEach((key) => {
      if (this.storage[key]) {
        callback.call(this, { key, value: this.storage[key]! }, i);
        i++;
      }
    });
  }

  get Storage() {
    return this.storage;
  }
}
