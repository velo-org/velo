import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { TypedArray } from '../utils/typedArray.ts';

//TODO: sufficent delete method
type keyType = number | string;
/**
 * A cache object that deletes the least-recently-used items.
 *
 * @export
 * @class LRUCache
 * @extends {BaseCache}
 * @template V
 * @example
 * const lruc = new LRUCache({ maxCache: 5 }); // init LRUCache with a max of 5 key-value pairs
 * lruc.set(1, { hello: 'asdf' }); //sets 1
 * lruc.set('2', { hello: 'asdf' }); // sets 2
 * lruc.set('3', { hello: 'asdf' }); // sets 3
 * lruc.set('4', { hello: 'asdf' }); // sets 4
 * lruc.set('5', { hello: 'asdf' }); // sets 5
 * 
 * lruc.get('2'); // gets 2 and pushes to the front
 *
 * lruc.set('6', { hello: 'asdfdd' }); // removes 1 sets 6 
 * lruc.set('7', { hello: 'asdfdd' }); // removes 3 sets 7
 * lruc.set(8, { hello: 'asdfdd' }); // removes 4 sets 8

 */
export class LRUCache<V = any> extends BaseCache {
  private head: number;
  private tail: number;
  private keys: (string | number)[];
  private values: V[];
  private forward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;

  private items: { [key in keyType]: number };
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
    this.keys = new Array(this.maxCache);
    this.values = new Array(this.maxCache);
  }

  set(key: keyType, value: V) {
    let pointer = this.items[key];

    if (pointer) {
      this.toTop(pointer);
      this.values[pointer] = value;

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
    this.values[pointer] = value;

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

  get(key: keyType): V | undefined {
    const pointer = this.items[key];

    if (!pointer) return;

    this.toTop(pointer);

    return this.values[pointer];
  }

  peek(key: keyType) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    return this.values[pointer];
  }

  forEach(callback: (item: { value: V; key: keyType }, index: number) => void) {
    console.log(this.forward);
    console.log(this.backward);
    console.log(this.head);
    console.log(this.tail);
    console.log(this.items);
    let i = 0,
      l = this.size;
    let pointer = this.head,
      keys = this.keys,
      values = this.values,
      forward = this.forward;

    while (i < l) {
      callback.call(this, { value: values[pointer], key: keys[pointer] }, i);

      pointer = forward[pointer];

      i++;
    }
  }

  has(key: keyType) {
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
