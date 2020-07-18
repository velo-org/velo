import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

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
  private keys: (string | number | undefined)[];
  private values: (V | undefined)[];
  private forward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private freeMemory: number[];

  private items: { [key in Key]: number };
  private size: number;

  constructor(options: Options) {
    super(options);
    if (!this.maxCache) throw new Error('Please provide a Maximum Cache');
    this.forward = getTypedArray(this.maxCache);
    this.backward = getTypedArray(this.maxCache);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.freeMemory = [];
    this.keys = new Array(this.maxCache);
    this.values = new Array(this.maxCache);
  }

  set(key: Key, value: V) {
    if (this.freeMemory.length === this.maxCache) this.freeMemory = [];
    let pointer = this.items[key];

    if (pointer) {
      this.toTop(pointer);
      this.values[pointer] = value;

      return;
    }

    // The cache is not yet full
    if (this.size < this.maxCache!) {
      if (this.freeMemory.length > 0) {
        pointer = this.freeMemory[0];
        this.freeMemory.splice(0, 1);
        this.size++;
        this.toTop(pointer);
        this.items[key] = pointer;
        this.keys[pointer] = key;
        this.values[pointer] = value;
        return;
      } else {
        pointer = this.size++;
      }
    }

    // Cache is full, we need to drop the last value
    else {
      pointer = this.tail;
      this.tail = this.backward[pointer];
      delete this.items[this.keys[pointer]!];
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

  setPop(key: Key, value: V) {
    if (this.freeMemory.length === this.maxCache) this.freeMemory = [];
    var oldValue = null;
    var oldKey = null;
    // The key already exists, we just need to update the value and splay on top
    var pointer = this.items[key];

    if (typeof pointer !== 'undefined') {
      this.toTop(pointer);
      oldValue = this.values[pointer];
      this.values[pointer] = value;
      return { evicted: false, key: key, value: oldValue };
    }

    // The cache is not yet full
    if (this.size < this.maxCache!) {
      if (this.freeMemory.length > 0) {
        pointer = this.freeMemory[0];
        this.freeMemory.splice(0, 1);
        this.size++;
        this.toTop(pointer);
        this.items[key] = pointer;
        this.keys[pointer] = key;
        this.values[pointer] = value;
        return;
      } else {
        pointer = this.size++;
      }
    }

    // Cache is full, we need to drop the last value
    else {
      pointer = this.tail;
      this.tail = this.backward[pointer];
      oldValue = this.values[pointer];
      oldKey = this.keys[pointer];
      delete this.items[this.keys[pointer]!];
    }

    // Storing key & value
    this.items[key] = pointer;
    this.keys[pointer] = key;
    this.values[pointer] = value;

    // Moving the item at the front of the list
    this.forward[pointer] = this.head;
    this.backward[this.head] = pointer;
    this.head = pointer;

    // Return object if eviction took place, otherwise return null
    if (oldKey) {
      return { evicted: true, key: oldKey, value: oldValue };
    } else {
      return null;
    }
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
    this.freeMemory = [];
    this.keys = [];
    this.values = [];
    this.backward = getTypedArray(this.maxCache!);
    this.forward = getTypedArray(this.maxCache!);
  }
  remove(key: Key) {
    const pointer = this.items[key];
    this.freeMemory.push(pointer);
    this.keys[pointer] = undefined;
    this.values[pointer] = undefined;
    this.size--;
    delete this.items[key];
  }

  get(key: Key): V | undefined {
    const pointer = this.items[key];

    if (pointer === undefined) return undefined;

    this.toTop(pointer);

    return this.values[pointer];
  }

  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    return this.values[pointer];
  }

  forEach(callback: (item: { value: V; key: Key }, index: number) => void) {
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
      if (keys[pointer]) {
        if (keys[pointer]) {
          callback.call(
            this,
            { value: values[pointer]!, key: keys[pointer]! },
            i
          );
          i++;
        }
      }

      pointer = forward[pointer];
    }
  }

  has(key: Key) {
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
