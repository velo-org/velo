import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { TypedArray } from '../utils/typedArray.ts';

//TODO: sufficent delete method

export class LRUCache extends BaseCache {
  private head: number;
  private tail: number;
  private keys: string[];
  private values: string[];
  private forward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private items: { [key: string]: number };
  private size: number;

  constructor(options: Options) {
    super(options);
    const PointerArray = TypedArray.getPointerArray(options.maxCache);
    this.forward = new PointerArray(options.maxCache);
    this.backward = new PointerArray(options.maxCache);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.keys = [];
    this.values = [];
  }

  set<T>(key: string, value: T) {
    let pointer = this.items[key];

    if (pointer) {
      this.toTop(pointer);
      this.values[pointer] = JSON.stringify(value);

      return;
    }

    // The cache is not yet full
    if (this.size < this.maxCache) {
      pointer = this.size++;
    }

    // Cache is full, we need to drop the last value
    else {
      pointer = this.tail;
      this.tail = this.backward[pointer];

      delete this.items[this.keys[pointer]];
    }

    // Storing key & value
    this.items[key] = pointer;
    this.keys[pointer] = key;
    this.values[pointer] = JSON.stringify(value);

    // Moving the item at the front of the list
    this.forward[pointer] = this.head;
    this.backward[this.head] = pointer;
    this.head = pointer;
  }

  toTop(pointer: number) {
    if (this.head === pointer) return;

    let oldHead = this.head;
    const previous = this.backward[pointer],
      next = this.forward[pointer];

    if (this.tail === pointer) {
      this.tail = previous;
    } else {
      this.backward[next] = previous;
    }

    this.forward[previous] = next;

    this.backward[oldHead] = pointer;
    this.head = pointer;
    this.forward[pointer] = oldHead;

    return;
  }

  clear() {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.items = {};
  }

  get<T>(key: string): T | undefined {
    const pointer = this.items[key];

    if (typeof pointer === 'undefined') return;

    this.toTop(pointer);

    return JSON.parse(this.values[pointer]);
  }

  peek(key: string) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    return this.values[pointer];
  }

  forEach<T>(
    callback: (item: { value: T; key: string }, index: number) => void
  ) {
    let i = 0,
      l = this.size;
    var pointer = this.head,
      keys = this.keys,
      values = this.values,
      forward = this.forward;

    while (i < l) {
      callback.call(
        this,
        { value: JSON.parse(values[pointer]), key: keys[pointer] },
        i
      );

      pointer = forward[pointer];

      i++;
    }
  }

  has(key: string) {
    return this.items[key] ? true : false;
  }

  get Keys() {
    return this.keys;
  }

  get Values() {
    return this.values;
  }

  get Size() {
    return this.size;
  }
}
