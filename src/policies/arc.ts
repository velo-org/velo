import { Key } from "../models/cache.ts";
import { ArcInternal, Policy } from "../models/policy.ts";
import { PointerList } from "../utils/pointerList.ts";

export class ARC<K extends Key, V> implements Policy<V, K> {
  private partition = 0;

  private t1: ARCList<K, V>;
  private t2: ARCList<K, V>;
  private b1: ARCList<K, null>;
  private b2: ARCList<K, null>;

  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
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

  set(key: K, value: V) {
    // in frequent set
    if (this.t2.has(key)) {
      this.t2.insert(key, value);
      return;
    }

    // in recent set
    if (this.t1.has(key)) {
      this.t1.remove(key);
      this.t2.insert(key, value);
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

    this.t1.insert(key, value);
  }

  get(key: K): V | undefined {
    const value = this.t1.removeWithValue(key);
    // if in t1 move to t2
    if (value) {
      this.t2.insert(key, value);
    }
    return this.t2.get(key);
  }

  has(key: K) {
    return this.t1.has(key) || this.t2.has(key);
  }

  peek(key: K) {
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
  remove(key: K) {
    const value = this.peek(key);
    if (value) {
      this.t1.remove(key);
      this.t2.remove(key);
      this.b1.remove(key);
      this.b2.remove(key);
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
  }

  get size() {
    return this.t1.size() + this.t2.size();
  }

  get keys() {
    return this.t1.keys.concat(this.t2.keys);
  }

  get values() {
    return this.t1.values.concat(this.t2.values);
  }

  get internalData(): ArcInternal<K> {
    return {
      t1: this.t1.keys,
      t2: this.t2.keys,
      b1: this.b1.keys,
      b2: this.b2.keys,
    };
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

  forEach(callback: (item: { key: K; value: V }, index: number) => void) {
    this.t1.forEach(0, callback);
    this.t2.forEach(this.t1.size(), callback);
  }

  *[Symbol.iterator]() {
    for (const entry of this.t1) {
      yield entry;
    }
    for (const entry of this.t2) {
      yield entry;
    }
  }
}

/**
 * An LRU with some special functions
 */
class ARCList<K extends Key, V> {
  private items: { [key in Key]: number } = {};
  private _keys: Array<K | undefined>;
  private _values: Array<V | undefined>;
  private pointers: PointerList;

  constructor(capacity: number) {
    this._keys = new Array<K>();
    this._values = new Array<V>();
    this.pointers = new PointerList(capacity);
  }

  has(key: K) {
    return this.items[key] !== undefined ? true : false;
  }

  get(key: K): V | undefined {
    const p = this.items[key];
    if (p === undefined) return undefined;
    this.pointers.moveToFront(p);
    return this._values[p];
  }

  peek(key: K): V | undefined {
    const p = this.items[key];
    if (p === undefined) return undefined;
    return this._values[p];
  }

  remove(key: K) {
    const p = this.items[key];
    if (p !== undefined) {
      delete this.items[key];
      this._keys[p] = undefined;
      this._values[p] = undefined;
      this.pointers.remove(p);
    }
  }

  removeWithValue(key: K): V | undefined {
    const p = this.items[key];

    if (p === undefined) return undefined;

    const value = this._values[p];
    delete this.items[key];
    this._keys[p] = undefined;
    this._values[p] = undefined;
    this.pointers.remove(p);
    return value;
  }

  insert(key: K, value: V) {
    let p = this.items[key];

    if (p === undefined) {
      p = this.pointers.newPointer()!;
      this.pointers.pushFront(p);
      this._keys[p] = key;
      this.items[key] = p;
    }

    this._values[p] = value;
  }

  moveToFront(key: K) {
    const p = this.items[key];
    this.pointers.moveToFront(p);
  }

  removeBack(): K {
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
    callback: (item: { key: K; value: V }, index: number) => void
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

  *[Symbol.iterator]() {
    let p: number | undefined = this.pointers.front;

    for (let i = 0; p != undefined; i++) {
      yield { key: this._keys[p]!, value: this._values[p]! };
      p = this.pointers.nextOf(p);
    }
  }

  get keys(): K[] {
    return this._keys.filter((k) => k !== undefined) as K[];
  }

  get values(): V[] {
    return this._values.filter((v) => v !== undefined) as V[];
  }
}
