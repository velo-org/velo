import { NoopCounter } from "../cache/stats/noopCounter.ts";
import { Key } from "../models/cache.ts";
import { Policy } from "../models/policy.ts";
import { StatCounter } from "../models/stats.ts";
import { PointerList } from "../utils/pointer_list.ts";

/**
 * Least Recently Used (LRU)
 */
export class LRU<K extends Key, V> implements Policy<K, V> {
  statCounter: StatCounter = new NoopCounter();
  private _keys: Array<K | undefined>;
  private _values: Array<V | undefined>;
  private items: { [key in Key]: number };
  private pointers: PointerList;

  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.items = {};
    this._keys = new Array(this.capacity);
    this._values = new Array(this.capacity);
    this.pointers = new PointerList(this.capacity);
  }

  set(key: K, value: V) {
    let pointer: number = this.items[key];

    if (pointer) {
      this.pointers.moveToFront(pointer);
      this._values[pointer] = value;
      return;
    }

    // The cache is not yet full
    if (!this.pointers.isFull()) {
      pointer = this.pointers.newPointer();
    } // Cache is full, we need to drop the last value
    else {
      pointer = this.pointers.removeBack();
      delete this.items[this._keys[pointer]!];
      pointer = this.pointers.newPointer();
      this.statCounter.recordEviction();
    }

    // Storing key & value
    this.items[key] = pointer;
    this._keys[pointer] = key;
    this._values[pointer] = value;

    this.pointers.pushFront(pointer);
  }

  clear() {
    this.items = {};
    this._keys = [];
    this._values = [];
    this.pointers.clear();
  }

  remove(key: K) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    this.pointers.remove(pointer);
    this._keys[pointer] = undefined;
    this._values[pointer] = undefined;

    delete this.items[key];
  }

  get(key: K): V | undefined {
    const pointer = this.items[key];

    if (pointer === undefined) {
      this.statCounter.recordMiss();
      return undefined;
    }

    this.statCounter.recordHit();
    this.pointers.moveToFront(pointer);
    return this._values[pointer];
  }

  has(key: K) {
    return this.items[key] !== undefined ? true : false;
  }

  peek(key: K) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    return this._values[pointer];
  }

  get size() {
    return this.pointers.size;
  }

  get keys() {
    return this._keys.filter((k) => k !== undefined) as K[];
  }

  get values() {
    return this._values.filter((v) => v !== undefined) as V[];
  }

  forEach(callback: (item: { key: K; value: V }, index: number) => void) {
    let p: number | undefined = this.pointers.front;

    for (let i = 0; p != undefined; i++) {
      callback({ key: this._keys[p]!, value: this._values[p]! }, i);
      p = this.pointers.nextOf(p);
    }
  }

  *[Symbol.iterator]() {
    let p: number | undefined = this.pointers.front;

    for (let i = 0; p != undefined; i++) {
      yield { key: this._keys[p]!, value: this._values[p]! };
      p = this.pointers.nextOf(p);
    }
  }
}
