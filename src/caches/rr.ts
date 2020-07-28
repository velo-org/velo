import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray, TypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

/**
 * Random Replacement Cache
 */
export class RR<V = any> extends BaseCache<V> {
  private storage: { [key in Key]: V | undefined };
  private _keys: (Key | undefined)[];
  private freeMemory: number;
  private counter: number;
  private _size: number;
  private randomArr: TypedArray;

  constructor(options: Options) {
    super(options);
    if (!this.capacity) throw new Error('Please provide a Maximum Cache');
    this.storage = {};
    this._keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this._size = 0;
    this.randomArr = getTypedArray(this.capacity);
    for (var i = this.capacity; i > 0; i--) {
      this.randomArr[i] = (this.capacity * Math.random()) | 0;
    }
  }

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   * @param ttl The max time to live in ms
   */
  set(key: Key, value: V, ttl?: number) {
    this.applyTTL(key, ttl);

    if (this.storage[key]) {
      this.storage[key] = value;
      return;
    }
    if (this._size >= this.capacity) {
      const prop = this.randomProperty()!;
      delete this.storage[prop];
    } else {
      this._size++;
    }
    if (this.freeMemory !== -1 && this._size < this.capacity) {
      this._keys[this.freeMemory] = key;
      this.freeMemory = -1;
    } else {
      this._keys.push(key);
    }
    this.storage[key] = value;
  }
  private randomProperty() {
    let num = this.randomArr[this.counter];
    this.counter++;
    if (this.counter >= this.capacity) this.counter = 0;
    if (this.freeMemory === num) num += 1;
    const key = this._keys[num];
    this._keys[num] = undefined;
    this.freeMemory = num;

    return key;
  }

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key) {
    return this.storage[key];
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    this._keys.splice(this._keys.indexOf(key), 1);
    this._size--;
    delete this.storage[key];
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this.storage).forEach((key, i) => {
      callback.call(this, { key, value: this.storage[key]! }, i);
    });
  }

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: Key) {
    return this.storage[key] !== undefined ? true : false;
  }

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key) {
    return this.get(key);
  }

  /**
   * List of keys in the cache
   */
  get keys() {
    return Object.keys(this.storage);
  }

  /**
   * List of values in the cache
   */
  get values() {
    return Object.keys(this.storage)
      .filter((k) => this.storage[k] !== undefined)
      .map((k) => this.storage[k]!);
  }

  /**
   * Current number of entries in the cache
   */
  get size() {
    return this._size;
  }

  /**
   * Reset the cache
   */
  clear() {
    this._size = 0;
    this._keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this.storage = {};
  }
}
