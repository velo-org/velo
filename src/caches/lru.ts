import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';
import { PointerList } from '../utils/pointerList.ts';

/**
 * Least Recently Used Cache
 */
export class LRU<V = any> extends BaseCache<V> {
  private _keys: Array<Key | undefined>;
  private _values: Array<V | undefined>;
  private items: { [key in Key]: number };
  private pointers: PointerList;

  constructor(options: Options) {
    super(options);
    this.items = {};
    this._keys = new Array(this.capacity);
    this._values = new Array(this.capacity);
    this.pointers = new PointerList(this.capacity);
  }

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   * @param ttl The max time to live in ms
   */
  set(key: Key, value: V, ttl?: number) {
    this.checkForTtl(key, ttl);
    let pointer = this.items[key];

    if (pointer) {
      this.pointers.moveToFront(pointer);
      this._values[pointer] = value;

      return;
    }

    // The cache is not yet full
    if (!this.pointers.isFull()) {
      pointer = this.pointers.newPointer()!;
    }

    // Cache is full, we need to drop the last value
    else {
      pointer = this.pointers.removeBack();
      delete this.items[this._keys[pointer]!];
      pointer = this.pointers.newPointer()!;
    }

    // Storing key & value
    this.items[key] = pointer;
    this._keys[pointer] = key;
    this._values[pointer] = value;

    this.pointers.pushFront(pointer);
  }

  /**
   * Reset the cache
   */
  clear() {
    this.items = {};
    this._keys = [];
    this._values = [];
    this.pointers.clear();
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    const pointer = this.items[key];
    this.pointers.remove(pointer);
    this._keys[pointer] = undefined;
    this._values[pointer] = undefined;
    delete this.items[key];
  }

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key): V | undefined {
    const pointer = this.items[key];

    if (pointer === undefined) return;

    this.pointers.moveToFront(pointer);
    return this._values[pointer];
  }

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: Key) {
    return this.items[key] !== undefined ? true : false;
  }

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    return this._values[pointer];
  }

  /**
   * Current number of entries in the cache
   */
  get size() {
    return this.pointers.size;
  }

  /**
   * List of keys in the cache
   */
  get keys() {
    return this._keys.filter((k) => k !== undefined);
  }

  /**
   * List of values in the cache
   */
  get values() {
    return this._values.filter((v) => v !== undefined);
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(
    callback: (item: { key: Key; value: V }, index: number) => void,
    reverse: boolean = false
  ) {
    let p: number | undefined = this.pointers.nextOf(this.pointers.front);

    for (
      let i = reverse ? this.pointers.size : 0;
      p !== undefined;
      reverse ? i-- : i++
    ) {
      callback({ key: this._keys[p]!, value: this._values[p]! }, i);
      p = reverse ? this.pointers.prevOf(p) : this.pointers.nextOf(p);
    }
  }
}
