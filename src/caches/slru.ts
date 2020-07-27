import { BaseCache } from './base.ts';
import { SLRUOptions } from '../models/slruOptions.ts';
import { Key } from '../models/key.ts';
import { Cache } from '../models/Cache.ts';
import { PointerList } from '../utils/pointerList.ts';

/**
 * Segmented LRU Cache
 */
export class SLRU<V = any> extends BaseCache<V> implements Cache<V> {
  private protectedPartition: SLRUList<V>;
  private probationaryPartition: SLRUList<V>;
  private items: { [key in Key]: V };
  private protectedCache: number;
  private probationaryCache: number;

  constructor(options: SLRUOptions) {
    super({
      capacity: options.probationaryCache + options.protectedCache,
    });
    this.protectedCache = options.protectedCache;
    this.probationaryCache = options.probationaryCache;
    this.protectedPartition = new SLRUList<V>(this.protectedCache);
    this.probationaryPartition = new SLRUList<V>(this.probationaryCache);
    this.items = {};
  }

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   */
  set(key: Key, value: V) {
    this.probationaryPartition.setPop(key, value);
  }

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key) {
    const cObjectProtected = this.protectedPartition.get(key);
    const cObjectProbationary = this.probationaryPartition.peek(key);
    if (!cObjectProtected && !cObjectProbationary) return undefined;
    if (cObjectProtected) return cObjectProtected;
    else {
      const cObject = this.protectedPartition.setPop(key, cObjectProbationary!);
      if (!cObject) {
        this.probationaryPartition.remove(key);
        return cObjectProbationary!;
      }
      this.probationaryPartition.setPop(key, cObject.value!);
      return cObjectProbationary;
    }
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { value: V; key: Key }, index: number) => void) {
    this.protectedPartition.forEach(0, callback);
    this.probationaryPartition.forEach(
      this.protectedPartition.size(),
      callback
    );
  }

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key) {
    return this.probationaryPartition.peek(key)
      ? this.probationaryPartition.peek(key)
      : this.protectedPartition.peek(key);
  }

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: Key) {
    return this.probationaryPartition.has(key)
      ? true
      : this.protectedPartition.has(key);
  }

  get ProtectedPartition() {
    return this.protectedPartition;
  }

  get PropationaryPartition() {
    return this.probationaryPartition;
  }

  /**
   * Current number of entries in the cache
   */
  get size() {
    return this.probationaryPartition.size() + this.protectedPartition.size();
  }

  /**
   * List of keys in the cache
   */
  get keys() {
    return this.probationaryPartition.keys.concat(this.protectedPartition.keys);
  }

  /**
   * List of values in the cache
   */
  get values() {
    return this.probationaryPartition.values.concat(
      this.protectedPartition.values
    );
  }

  /**
   * Reset the cache
   */
  clear() {
    this.probationaryPartition.clear();
    this.protectedPartition.clear();
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    const propationaryObj = this.probationaryPartition.peek(key);
    const protectedObj = this.protectedPartition.peek(key);
    if (!propationaryObj && !protectedObj) throw new Error('Key not found');
    else if (propationaryObj) {
      this.probationaryPartition.remove(key);
    } else {
      this.protectedPartition.remove(key);
    }
  }
}

/** An LRU with some special functions */
class SLRUList<V> {
  private items: { [key in Key]: number } = {};
  keys: Array<Key>;
  private pointers: PointerList;
  values: Array<V>;

  constructor(capacity: number) {
    this.keys = new Array<Key>(capacity);
    this.pointers = new PointerList(capacity);
    this.values = new Array<V>();
  }

  has(key: Key) {
    return this.items[key] ? true : false;
  }

  get(key: Key): V | undefined {
    const p = this.items[key];
    if (!p) return undefined;
    this.pointers.moveToFront(p);
    return this.values[p];
  }

  peek(key: Key): V | undefined {
    const p = this.items[key];
    if (!p) return undefined;
    return this.values[p];
  }

  remove(key: Key) {
    const p = this.items[key];
    if (p) {
      delete this.items[key];
      this.pointers.remove(p);
    }
  }

  setPop(key: Key, value: V) {
    let pointer = this.items[key];
    let entry = null;

    if (pointer) {
      this.pointers.moveToFront(pointer);
      this.values[pointer] = value;
      return { key: key, value: value, evicted: false };
    }

    // The cache is not yet full
    if (!this.pointers.isFull()) {
      pointer = this.pointers.newPointer()!;
    }

    // Cache is full, we need to drop the last value
    else {
      pointer = this.pointers.removeBack();
      entry = {
        evicted: true,
        key: this.keys[pointer],
        value: this.values[pointer],
      };
      delete this.items[this.keys[pointer]!];
      pointer = this.pointers.newPointer()!;
    }

    // Storing key & value
    this.items[key] = pointer;
    this.keys[pointer] = key;
    this.values[pointer] = value;
    this.pointers.pushFront(pointer);

    return entry;
  }

  clear() {
    this.items = {};
    this.keys = [];
    this.values = [];
    this.pointers.clear();
  }

  size() {
    return this.pointers.size;
  }

  forEach(
    start: number,
    callback: (item: { key: Key; value: V }, index: number) => void
  ) {
    let p: number | undefined = this.pointers.nextOf(this.pointers.front);

    for (let i = start; p !== undefined; i++) {
      callback({ key: this.keys[p]!, value: this.values[p] }, i);
      p = this.pointers.nextOf(p);
    }
  }
}
