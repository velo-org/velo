import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';
import { Cache } from '../models/Cache.ts';

export class RR<V = any> extends BaseCache<V> implements Cache<V> {
  private storage: { [key in Key]: V | undefined };
  private _keys: (Key | undefined)[];
  private freeMemory: number;
  private counter: number;
  private _size: number;
  private randomArr: Float64Array | Uint8Array | Uint16Array | Uint32Array;

  constructor(options: Options) {
    super(options);
    if (!this.capacity) throw new Error('Please provide a Maximum Cache');
    this.storage = {};
    this._keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this._size = 0;
    this.randomArr = getTypedArray(this.capacity);
    for (var i = this.capacity; i > 0; i--) {
      this.randomArr[i] = (this.capacity * Math.random()) | 0;
    }
  }

  set(key: Key, value: V) {
    if (this.storage[key]) {
      this.storage[key] = value;
      return;
    }
    if (this._size >= this.capacity) {
      const prop = this.randomProperty()!;
      delete this.storage[prop];
    } else {
      this._size++;
    }
    if (this.freeMemory !== -1 && this._size < this.capacity) {
      this._keys[this.freeMemory] = key;
      this.freeMemory = -1;
    } else {
      this._keys.push(key);
    }
    this.storage[key] = value;
  }
  private randomProperty() {
    let num = this.randomArr[this.counter];
    this.counter++;
    if (this.counter >= this.capacity) this.counter = 0;
    if (this.freeMemory === num) num += 1;
    const key = this._keys[num];
    this._keys[num] = undefined;
    this.freeMemory = num;

    return key;
  }

  get(key: Key) {
    return this.storage[key];
  }

  remove(key: Key) {
    this._keys.splice(this._keys.indexOf(key), 1);
    delete this.storage[key];
  }

  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this.storage).forEach((key, i) => {
      callback.call(this, { key, value: this.storage[key]! }, i);
    });
  }

  has(key: Key) {
    return this.storage[key] ? true : false;
  }

  peek(key: Key) {
    return this.get(key);
  }

  get keys() {
    return Object.keys(this.storage);
  }

  get values() {
    return Object.keys(this.storage)
      .filter((k) => this.storage[k] !== undefined)
      .map((k) => this.storage[k]!);
  }

  get size() {
    return this._size;
  }

  clear() {
    this._size = 0;
    this._keys = [];
    this.freeMemory = -1;
    this.counter = 0;
    this.storage = {};
  }
}
