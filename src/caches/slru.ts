import { BaseCache } from "./base.ts";
import { SLRUOptions } from "../models/slruOptions.ts";
import { Key } from "../models/key.ts";
import { PointerList } from "../utils/pointerList.ts";

/**
 * Segmented LRU Cache
 */
export class SLRU<V> extends BaseCache<V> {
  private protectedPartition: SLRUList<V>;
  private probationaryPartition: SLRUList<V>;
  private protectedCache: number;
  private probationaryCache: number;

  constructor(options: SLRUOptions) {
    super({
      capacity: options.probationaryCache + options.protectedCache,
      ...options,
    });
    this.protectedCache = options.protectedCache;
    this.probationaryCache = options.probationaryCache;
    this.protectedPartition = new SLRUList<V>(this.protectedCache);
    this.probationaryPartition = new SLRUList<V>(this.probationaryCache);
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
    this.fireSetEvent(key, value);
    const entry = this.probationaryPartition.setPop(key, value);
    if (entry?.evicted) {
      this._stats.hits++;
    } else {
      this._stats.misses++;
    }
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
      this.probationaryPartition.remove(key);
      if (!cObject || cObject.evicted === false) {
        return cObjectProbationary!;
      }
      this.probationaryPartition.setPop(cObject.key!, cObject.value!);
      return cObjectProbationary;
    }
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { value: V; key: Key }, index: number) => void) {
    this.protectedPartition.forEach(callback);
    this.probationaryPartition.forEach(callback);
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
    return this.probationaryPartition.keys
      .concat(this.protectedPartition.keys)
      .filter((k) => k != undefined);
  }

  /**
   * List of values in the cache
   */
  get values() {
    return this.probationaryPartition.values
      .concat(this.protectedPartition.values)
      .filter((v) => v != undefined);
  }

  /**
   * Reset the cache
   */
  clear() {
    this.probationaryPartition.clear();
    this.protectedPartition.clear();
    this.fireClearEvent();
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    const propationaryObj = this.probationaryPartition.peek(key);
    const protectedObj = this.protectedPartition.peek(key);
    if (!propationaryObj && !protectedObj) return undefined;
    else if (propationaryObj) {
      this.fireRemoveEvent(key, propationaryObj);
      this.probationaryPartition.remove(key);
    } else {
      this.fireRemoveEvent(key, protectedObj!);
      this.protectedPartition.remove(key);
    }
  }
}

/** An LRU with some special functions */
class SLRUList<V> {
  private items: { [key in Key]: number } = {};
  keys: Array<Key | undefined>;
  private pointers: PointerList;
  values: Array<V | undefined>;

  constructor(capacity: number) {
    this.keys = [];
    this.pointers = new PointerList(capacity);
    this.values = [];
  }

  has(key: Key) {
    return this.items[key] !== undefined ? true : false;
  }

  get(key: Key): V | undefined {
    const p = this.items[key];
    if (p === undefined) return undefined;
    this.pointers.moveToFront(p);
    return this.values[p];
  }

  peek(key: Key): V | undefined {
    const p = this.items[key];
    if (p === undefined) return undefined;
    return this.values[p];
  }

  remove(key: Key) {
    const p = this.items[key];
    if (p != undefined) {
      delete this.items[key];
      this.pointers.remove(p);
      this.values[p] = undefined;
      this.keys[p] = undefined;
    }
  }

  setPop(key: Key, value: V) {
    let pointer = this.items[key];
    let entry = null;

    if (pointer != undefined) {
      this.pointers.moveToFront(pointer);
      this.values[pointer] = value;
      return { key: key, value: value, evicted: false };
    }

    // The cache is not yet full
    if (!this.pointers.isFull()) {
      pointer = this.pointers.newPointer()!;
    } // Cache is full, we need to drop the last value
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

  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    if (!this.pointers.back && !this.pointers.front) return;
    let p: number | undefined = this.pointers.front;

    for (let i = 0; p !== undefined; i++) {
      callback({ key: this.keys[p]!, value: this.values[p]! }, i);
      p = this.pointers.nextOf(p);
    }
  }
}
