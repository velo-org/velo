import { Key } from "../models/cache.ts";
import { PointerList } from "../utils/pointerList.ts";
import { BasePolicy } from "./common.ts";

/**
 * Least Recently Used Cache
 */
export class LRU<K extends Key, V> extends BasePolicy<K, V> {
  private _keys: Array<K | undefined>;
  private _values: Array<V | undefined>;
  private items: { [key in Key]: number };
  private pointers: PointerList;

  constructor(capacity: number) {
    super(capacity);
    this.items = {};
    this._keys = new Array(this.capacity);
    this._values = new Array(this.capacity);
    this.pointers = new PointerList(this.capacity);
  }

  set(key: K, value: V) {
    let pointer = this.items[key];

    if (pointer) {
      this.pointers.moveToFront(pointer);
      this._values[pointer] = value;
      return;
    }

    // The cache is not yet full
    if (!this.pointers.isFull()) {
      pointer = this.pointers.newPointer()!;
    } // Cache is full, we need to drop the last value
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

    if (pointer === undefined) return;

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