import { RemoveCause, RemoveListener } from "../cache/capabilities/remove_listener_capability.ts";
import { Key } from "../cache/key.ts";
import { PointerList } from "../utils/pointer_list.ts";
import { Policy } from "./policy.ts";

/**
 * Implementation of an Adaptive Replacement Cache (ARC) [1]. It adapitvely balances
 * between recency and frequency. This is achieved by keeping track of evicted
 * keys and their frequencies in _ghost lists_ (b1 and b2). This increases the
 * overall size of the cache, but allows for a better hit rate.
 *
 * - t1: for recent cache entries.
 * - t2: for frequent entries, referenced at least twice.
 * - b1: ghost entries recently evicted from the T1 cache, but are still tracked.
 * - b2: similar ghost entries, but evicted from T2.
 *
 * [1]https://www.usenix.org/legacy/events/fast03/tech/full_papers/megiddo/megiddo.pdf
 */
export class Arc<K extends Key, V> implements Policy<K, V> {
  private partition = 0;

  private t1: ArcList<K, V>;
  private t2: ArcList<K, V>;
  private b1: ArcList<K, null>;
  private b2: ArcList<K, null>;

  readonly capacity: number;
  onEvict?: RemoveListener<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.t1 = new ArcList(this.capacity);
    this.t2 = new ArcList(this.capacity);
    this.b1 = new ArcList(this.capacity);
    this.b2 = new ArcList(this.capacity);
  }

  private replace(in_t2: boolean) {
    const t1Size = this.t1.size();

    if (t1Size > 0 && (t1Size > this.partition || (t1Size === this.partition && in_t2))) {
      const oldKey = this.t1.evict(this.onEvict);
      this.b1.insert(oldKey, null);
    } else {
      const oldKey = this.t2.evict(this.onEvict);
      this.b2.insert(oldKey, null);
    }
  }

  set(key: K, value: V) {
    // in frequent set
    if (this.t2.has(key)) {
      return this.t2.insert(key, value);
    }

    // in recent set
    if (this.t1.has(key)) {
      this.t1.remove(key);
      return this.t2.insert(key, value);
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
      return this.t2.insert(key, value);
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
      return this.t2.insert(key, value);
    }

    // not in cache or ghost lists

    if (this.size >= this.capacity) {
      this.replace(false);
    }

    if (this.b1.size() > this.capacity - this.partition) {
      this.b1.evict();
    }

    if (this.b2.size() > this.partition) {
      this.b2.evict();
    }

    this.t1.insert(key, value);
  }

  get(key: K): V | undefined {
    let value = this.t1.removeWithValue(key);

    // if in t1 move to t2
    if (value) {
      this.t2.insert(key, value);
    }
    value = this.t2.get(key);
    return value;
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
    if (this.t1.has(key)) {
      return this.t1.remove(key);
    }
    if (this.t2.has(key)) {
      return this.t2.remove(key);
    }
    return undefined;
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

  forEach(callback: (item: { key: K; value: V }, index: number) => void) {
    this.t1.forEach(0, callback);
    this.t2.forEach(this.t1.size(), callback);
  }
}

/**
 * An LRU with some special functions
 */
class ArcList<K extends Key, V> {
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
    const p: number = this.items[key];
    if (p !== undefined) {
      const oldValue = this._values[p];
      delete this.items[key];
      this._keys[p] = undefined;
      this._values[p] = undefined;
      this.pointers.remove(p);
      return oldValue;
    }
    return undefined;
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
    let p: number = this.items[key];
    const oldValue = this._values[p];

    if (p === undefined) {
      p = this.pointers.newPointer();
      this.pointers.pushFront(p);
      this._keys[p] = key;
      this.items[key] = p;
    }

    this._values[p] = value;
    return oldValue;
  }

  evict(onEvict?: RemoveListener<K, V>): K {
    const p = this.pointers.removeBack();
    const key = this._keys[p]!;
    if (onEvict) {
      onEvict(key, this._values[p]!, RemoveCause.Evicted);
    }
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

  forEach(start: number, callback: (item: { key: K; value: V }, index: number) => void) {
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

  get keys(): K[] {
    return this._keys.filter((k) => k !== undefined) as K[];
  }

  get values(): V[] {
    return this._values.filter((v) => v !== undefined) as V[];
  }
}
