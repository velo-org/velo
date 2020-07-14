import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';

type keyType = number | string;
/**
 *A cache object that deletes a random entry
 *
 * @export
 * @class RRCache
 * @extends {BaseCache}
 * @template V
 * @example
 * const rrc = new RRCache({ maxCache: 5 }); // init Random Replacement Cache with max 5 key-value pairs
 * rrc.set('1', { hello: 'asdf' }); // sets 1
 * rrc.set('2', { hello: 'asdf' }); // sets 2
 * rrc.set('3', { hello: 'asdf' }); // sets 3
 * rrc.set('4', { hello: 'asdf' }); // sets 4
 * rrc.set('5', { hello: 'asdf' }); // sets 5
 *
 * rrc.set('6', { hello: 'asdfdd' }); // sets 6 removes random entry
 */
export class RRCache<V = any> extends BaseCache {
  private storage: { [key in keyType]: V | undefined };
  private keys: (keyType | undefined)[];
  private freeMemory: number;
  private counter: number;
  private size: number;
  private randomArr: Float64Array | Uint8Array | Uint16Array | Uint32Array;

  constructor(options: Options) {
    super(options);
    this.storage = {};
    this.keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this.size = 0;
    this.randomArr = getTypedArray(this.maxCache);
    for (var i = this.maxCache; i > 0; i--) {
      this.randomArr[i] = (this.maxCache * Math.random()) | 0;
    }
  }

  set(key: keyType, value: V) {
    if (this.storage[key]) {
      this.storage[key] = value;
      return;
    }
    if (this.size >= this.maxCache) {
      const prop = this.randomProperty()!;
      delete this.storage[prop];
    } else {
      this.size++;
    }
    if (this.freeMemory !== -1 && this.size < this.maxCache) {
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
  get Size() {
    return Object.keys(this.storage).length;
  }
}
