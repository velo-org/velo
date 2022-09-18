import { BaseCache } from "./base.ts";
import { Options } from "../models/options.ts";
import { Key } from "../models/key.ts";
import { PointerList } from "../utils/pointerList.ts";

/**
 * Adaptive Replacement Cache
 */
export class ARC<K extends Key, V> extends BaseCache<V, K> {
  private partition = 0;

  private t1: ARCList<V>;
  private t2: ARCList<V>;
  private b1: ARCList<null>;
  private b2: ARCList<null>;

  constructor(options: Options) {
    super(options);
    this.t1 = new ARCList(this.capacity);
    this.t2 = new ARCList(this.capacity);
    this.b1 = new ARCList(this.capacity);
    this.b2 = new ARCList(this.capacity);
  }

  private replace(in_t2: boolean) {
    const t1Size = this.t1.size();

    if (
      t1Size > 0 &&
      (t1Size > this.partition || (t1Size === this.partition && in_t2))
    ) {
      const oldKey = this.t1.removeBack();
      this.b1.insert(oldKey, null);
    } else {
      const oldKey = this.t2.removeBack();
      this.b2.insert(oldKey, null);
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
    this.fireSetEvent(key, value);
    this.applyTTL(key, ttl);

    // in frequent set
    if (this.t2.has(key)) {
      this.t2.insert(key, value);
      this._stats.hits++;
      return;
    }

    // in recent set
    if (this.t1.has(key)) {
      this.t1.remove(key);
      this.t2.insert(key, value);
      this._stats.hits++;
      return;
    }

    // in frequent evicted
    if (this.b2.has(key)) {
      const b1Size = this.b1.size();
      const b2Size = this.b2.size();
      const delta = b1Size > b2Size ? Math.floor(b1Size / b2Size) : 1;

      if (delta < this.partition) {
        this.partition -= delta;
      } else {
        this.partition = 0;
      }

      if (this.size >= this.capacity) {
        this.replace(true);
      }

      this.b2.remove(key);
      this.t2.insert(key, value);
      this._stats.misses++;

      return;
    }

    // in recent evicted
    if (this.b1.has(key)) {
      const b1Size = this.b1.size();
      const b2Size = this.b2.size();
      const delta = b2Size > b1Size ? Math.floor(b2Size / b1Size) : 1;

      if (delta <= this.capacity - this.partition) {
        this.partition += delta;
      } else {
        this.partition = this.capacity;
      }

      if (this.size >= this.capacity) {
        this.replace(false);
      }

      this.b1.remove(key);
      this.t2.insert(key, value);
      this._stats.misses++;

      return;
    }

    // not in cache or ghost lists

    if (this.size >= this.capacity) {
      this.replace(false);
    }

    if (this.b1.size() > this.capacity - this.partition) {
      this.b1.removeBack();
    }

    if (this.b2.size() > this.partition) {
      this.b2.removeBack();
    }

    this._stats.misses++;
    this.t1.insert(key, value);
  }

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key): V | undefined {
    const value = this.t1.removeWithValue(key);
    // if in t1 move to t2
    if (value) {
      this.t2.insert(key, value);
    }
    return this.t2.get(key);
  }

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: Key) {
    return this.t1.has(key) || this.t2.has(key);
  }

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key) {
    let value = this.t1.peek(key);

    if (!value) {
      value = this.t2.peek(key);
    }

    return value;
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    const value = this.peek(key);
    if (value) {
      this.t1.remove(key);
      this.t2.remove(key);
      this.b1.remove(key);
      this.b2.remove(key);
      this.fireRemoveEvent(key, value);
    }
  }

  /**
   * Reset the cache
   */
  clear() {
    this.partition = 0;
    this.t1.clear();
    this.t2.clear();
    this.b1.clear();
    this.b2.clear();
    this.fireClearEvent();
  }

  /**
   * Current number of entries in the cache
   */
  get size() {
    return this.t1.size() + this.t2.size();
  }

  /**
   * List of keys in the cache
   */
  get keys() {
    return this.t1.keys.concat(this.t2.keys);
  }

  /**
   * List of values in the cache
   */
  get values() {
    return this.t1.values.concat(this.t2.values);
  }

  get recentlySet() {
    return this.t1;
  }

  get frequentlySet() {
    return this.t2;
  }

  get recentlyEvicted() {
    return this.b1;
  }

  get frequentlyEvicted() {
    return this.b2;
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    this.t1.forEach(0, callback);
    this.t2.forEach(this.t1.size(), callback);
  }
}

/**
 * An LRU with some special functions
 */
class ARCList<V> {
  private items: { [key in Key]: number } = {};
  private _keys: Array<Key | undefined>;
  private _values: Array<V | undefined>;
  private pointers: PointerList;

  constructor(capacity: number) {
    this._keys = new Array<Key>();
    this._values = new Array<V>();
    this.pointers = new PointerList(capacity);
  }

  has(key: Key) {
    return this.items[key] !== undefined ? true : false;
  }

  get(key: Key): V | undefined {
    const p = this.items[key];
    if (p === undefined) return undefined;
    this.pointers.moveToFront(p);
    return this._values[p];
  }

  peek(key: Key): V | undefined {
    const p = this.items[key];
    if (p === undefined) return undefined;
    return this._values[p];
  }

  remove(key: Key) {
    const p = this.items[key];
    if (p !== undefined) {
      delete this.items[key];
      this._keys[p] = undefined;
      this._values[p] = undefined;
      this.pointers.remove(p);
    }
  }

  removeWithValue(key: Key): V | undefined {
    const p = this.items[key];

    if (p === undefined) return undefined;

    const value = this._values[p];
    delete this.items[key];
    this._keys[p] = undefined;
    this._values[p] = undefined;
    this.pointers.remove(p);
    return value;
  }

  insert(key: Key, value: V) {
    let p = this.items[key];

    if (p === undefined) {
      p = this.pointers.newPointer()!;
      this.pointers.pushFront(p);
      this._keys[p] = key;
      this.items[key] = p;
    }

    this._values[p] = value;
  }

  moveToFront(key: Key) {
    const p = this.items[key];
    this.pointers.moveToFront(p);
  }

  removeBack(): Key {
    const p = this.pointers.removeBack();
    const key = this._keys[p]!;
    delete this.items[key];
    this._keys[p] = undefined;
    this._values[p] = undefined;
    return key;
  }

  clear() {
    this.items = {};
    this._keys = [];
    this._values = [];
    this.pointers.clear();
  }

  size() {
    return this.pointers.size;
  }

  forEach(
    start: number,
    callback: (item: { key: Key; value: V }, index: number) => void
  ) {
    let p: number | undefined = this.pointers.front;

    for (let i = start; p !== undefined; i++) {
      if (this._keys[p]) {
        callback({ key: this._keys[p]!, value: this._values[p]! }, i);
        p = this.pointers.nextOf(p);
      } else {
        break;
      }
    }
  }

  get keys() {
    return this._keys.filter((k) => k !== undefined);
  }

  get values() {
    return this._values.filter((v) => v !== undefined);
  }
}
