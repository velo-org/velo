import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';
import { PointerList } from '../utils/pointerList.ts';
import { Cache } from '../models/Cache.ts';

export class LRU<V = any> extends BaseCache<V> implements Cache<V> {
  private _keys: Array<Key>;
  private _values: Array<V>;
  private items: { [key in Key]: number };
  pointers: PointerList;

  constructor(options: Options) {
    super(options);
    this.items = {};
    this._keys = new Array(this.capacity);
    this._values = new Array(this.capacity);
    this.pointers = new PointerList(this.capacity);
  }

  set(key: Key, value: V) {
    let pointer = this.items[key];

    if (pointer) {
      this.pointers.moveToFront(pointer);
      this._values[pointer] = value;

      return;
    }

    // The cache is not yet full
    if (!this.pointers.isFull()) {
      pointer = this.pointers.newPointer();
    }

    // Cache is full, we need to drop the last value
    else {
      this.pointers.removeBack();
      delete this.items[this._keys[pointer]!];
      pointer = this.pointers.newPointer();
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

  remove(key: Key) {
    const pointer = this.items[key];
    this.pointers.remove(pointer);
    delete this.items[key];
  }

  get(key: Key): V | undefined {
    const pointer = this.items[key];

    if (pointer === undefined) return;

    this.pointers.moveToFront(pointer);
    return this._values[pointer];
  }

  has(key: Key) {
    return this.items[key] ? true : false;
  }

  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    return this._values[pointer];
  }

  get size() {
    return this.pointers.size();
  }

  get keys() {
    return this._keys;
  }

  get values() {
    return this._values;
  }

  forEach(
    callback: (item: { key: Key; value: V }, index: number) => void,
    reverse: boolean = false
  ) {
    let p: number | undefined = this.pointers.nextOf(this.pointers.root);

    for (
      let i = reverse ? this.pointers.size(true) : 0;
      p !== undefined;
      reverse ? i-- : i++
    ) {
      callback({ key: this._keys[p]!, value: this._values[p] }, i);
      p = reverse ? this.pointers.prevOf(p) : this.pointers.nextOf(p);
    }
  }
}
