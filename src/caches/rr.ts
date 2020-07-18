import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

/**
 *A cache object that deletes a random entry
 *
 * @export
 * @class RRCache
 * @extends {BaseCache}
 * @template V
 * @example
 * const rrc = new RRCache({ capacity: 5 }); // init Random Replacement Cache with max 5 key-value pairs
 * rrc.set('1', { hello: 'asdf' }); // sets 1
 * rrc.set('2', { hello: 'asdf' }); // sets 2
 * rrc.set('3', { hello: 'asdf' }); // sets 3
 * rrc.set('4', { hello: 'asdf' }); // sets 4
 * rrc.set('5', { hello: 'asdf' }); // sets 5
 *
 * rrc.set('6', { hello: 'asdfdd' }); // sets 6 removes random entry
 */
export class RRCache<V = any> extends BaseCache {
  private storage: { [key in Key]: V | undefined };
  private keys: (Key | undefined)[];
  private freeMemory: number;
  private counter: number;
  private size: number;
  private randomArr: Float64Array | Uint8Array | Uint16Array | Uint32Array;

  constructor(options: Options) {
    super(options);
    if (!this.capacity) throw new Error('Please provide a Maximum Cache');
    this.storage = {};
    this.keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this.size = 0;
    this.randomArr = getTypedArray(this.capacity);
    for (var i = this.capacity; i > 0; i--) {
      this.randomArr[i] = (this.capacity * Math.random()) | 0;
    }
  }

  set(key: Key, value: V) {
    if (this.storage[key]) {
      this.storage[key] = value;
      return;
    }
    if (this.size >= this.capacity) {
      const prop = this.randomProperty()!;
      delete this.storage[prop];
    } else {
      this.size++;
    }
    if (this.freeMemory !== -1 && this.size < this.capacity) {
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
    if (this.counter >= this.capacity) this.counter = 0;
    if (this.freeMemory === num) num += 1;
    const key = this.keys[num];
    this.keys[num] = undefined;
    this.freeMemory = num;

    return key;
  }
  get(key: string): V {
    return this.storage[key]!;
  }

  remove(key: Key) {
    this.keys.splice(this.keys.indexOf(key), 1);
    delete this.storage[key];
  }

  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this.storage).forEach((key, i) => {
      callback.call(this, { key, value: this.storage[key]! }, i);
    });
  }

  has(key: Key) {
    return this.storage[key] ? true : false;
  }

  get Keys() {
    return this.keys.filter((key) => key !== undefined);
  }
  get Values() {
    return Object.keys(this.storage).map((k) => this.storage[k]);
  }
  get Size() {
    return this.size;
  }
  clear() {
    this.size = 0;
    this.keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this.storage = {};
  }
}
