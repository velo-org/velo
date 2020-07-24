import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';
import { Cache } from '../models/Cache.ts';

//TODO: delete single entry

export class SC<V = any> extends BaseCache<V> implements Cache<V> {
  private head: number;
  private tail: number;
  private arrayMap: { key: Key; value: V; sChance: boolean }[];
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private items: { [key in Key]: number };
  private _size: number;

  constructor(options: Options) {
    super(options);
    if (!this.capacity) throw new Error('Please provide a Maximum Cache');
    this.backward = getTypedArray(this.capacity);
    this.head = 0;
    this._size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
  }

  set(key: Key, value: V) {
    let pointer = this.items[key];
    if (pointer !== undefined) {
      this.arrayMap[pointer].value = value;
      this.arrayMap[pointer].sChance = true;
      return;
    }

    if (this._size < this.capacity!) {
      pointer = this._size++;
      this.items[key] = pointer;
      this.arrayMap[pointer] = { key, value, sChance: false };

      // Moving the item at the end of the list
      this.backward[this.tail] = pointer;
      this.backward[pointer] = this.head;
      this.tail = pointer;
    } else {
      let i = this.backward[this.tail];
      let found = false;
      while (i != this.tail) {
        if (!this.arrayMap[i].sChance) {
          delete this.items[this.arrayMap[i].key];
          this.items[key] = i;
          this.arrayMap[i] = { key, value, sChance: false };
          this.toBottom(i);
          found = true;
          break;
        }
        this.arrayMap[i].sChance = false;
        i = this.backward[i];
      }
      if (!found) {
        delete this.items[this.arrayMap[0].key];
        this.items[key] = 0;
        this.arrayMap[0] = { key, value, sChance: false };
        this.toBottom(0);
      }
    }
  }

  private toBottom(pointer: number) {
    if (this.tail === pointer) return;

    const previous = this.backward[pointer];

    if (this.head === pointer) {
      this.head = previous;
    } else if (this.backward[this.head] == pointer) {
      this.backward[this.head] = previous;
    } else {
      this.backward[pointer - 1] = previous;
    }

    this.backward[this.tail] = pointer;
    this.tail = pointer;
    this.backward[this.tail] = this.head;

    return;
  }

  get(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    this.arrayMap[pointer].sChance = true;
    return this.arrayMap[pointer].value;
  }

  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    return this.arrayMap[pointer].value;
  }

  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    this.arrayMap.forEach((val, i) => {
      callback.call(this, { key: val.key, value: val.value }, i);
    });
  }

  clear() {
    this.backward = getTypedArray(this.capacity!);
    this.head = 0;
    this._size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
  }

  remove(key: Key) {
    const pointer = this.items[key];
  }

  has(key: Key) {
    return this.items[key] ? true : false;
  }

  get keys() {
    return this.arrayMap.map((v) => v.key);
  }

  get values() {
    return this.arrayMap.map((v) => v.value);
  }

  get size() {
    return this._size;
  }
}
