import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

/**
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Random_replacement_(RR)
 *
 * Randomly selects a candidate item and discards it to make space when necessary.
 *
 * @example
 * ```ts
 * import {RR} from "https://deno.land/x/velo/mod.ts"
 *
 * const rrc = new RR({ capacity: 5 }); // init Random Replacement Cache with max 5 key-value pairs
 * rrc.set('1', { hello: 'asdf' }); // sets 1
 * rrc.set('2', { hello: 'asdf' }); // sets 2
 * rrc.set('3', { hello: 'asdf' }); // sets 3
 * rrc.set('4', { hello: 'asdf' }); // sets 4
 * rrc.set('5', { hello: 'asdf' }); // sets 5
 *
 * rrc.set('6', { hello: 'asdfdd' }); // sets 6 removes random entry
 * rrc.get('6') // returns value for key 6
 * ```
 */
export class RR<V = any> extends BaseCache {
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

  /**
   * Sets a Value with the corresponding Key
   *
   * @param {Key} key - the key for which the value gets stored
   * @param {V} value - the value that has to be stored
   */
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
  /**
   * Returns the value for a Key or undefined if the key was not found
   *
   * @param {Key} key - the Key for which you want a value
   */
  get(key: string) {
    return this.storage[key];
  }
  /**
   *  removes the specific entry
   *
   * @param {Key} key - the Key which you want to remove
   */
  remove(key: Key) {
    this.keys.splice(this.keys.indexOf(key), 1);
    delete this.storage[key];
  }
  /**
   *  add array like forEach to the cache Object
   *
   * @param {(item: { key: Key; value: V }, index: number) => void} callback - method which gets called forEach Iteration
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this.storage).forEach((key, i) => {
      callback.call(this, { key, value: this.storage[key]! }, i);
    });
  }
  /**
   * Checks if the Key is already in the cache
   *
   * @param {Key} key - the Key which you want to check
   */
  has(key: Key) {
    return this.storage[key] ? true : false;
  }
  /**
   *  getter for the Keys stored in the Cache
   *
   * @readonly
   */
  get Keys() {
    return this.keys.filter((key) => key !== undefined);
  }
  /**
   *  getter for the Values stored in the cache
   *
   * @readonly
   */
  get Values() {
    return Object.keys(this.storage).map((k) => this.storage[k]);
  }
  /**
   * getter for the current size of the cache
   *
   * @readonly
   */
  get Size() {
    return this.size;
  }
  /**
   * Resets the cache
   *
   */
  clear() {
    this.size = 0;
    this.keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this.storage = {};
  }
}
