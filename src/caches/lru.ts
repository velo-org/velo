import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

export class LRU<V = any> extends BaseCache {
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
    if (!this.capacity) throw new Error('Please provide a Maximum Cache');
    this.forward = getTypedArray(this.capacity);
    this.backward = getTypedArray(this.capacity);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.freeMemory = [];
    this.keys = new Array(this.capacity);
    this.values = new Array(this.capacity);
  }

  /**
   * Sets a Value with the corresponding Key
   *
   * @param {Key} key - the key for which the value gets stored
   * @param {V} value - the value that has to be stored
   */
  set(key: Key, value: V) {
    if (this.freeMemory.length === this.capacity) this.freeMemory = [];
    let pointer = this.items[key];

    if (pointer) {
      this.toTop(pointer);
      this.values[pointer] = value;

      return;
    }

    // The cache is not yet full
    if (this.size < this.capacity!) {
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

  /**
   * Sets a Value with the corresponding Key. returns the oldvalue and the oldKey and if an eviction took place
   *
   * @param {Key} key - the key for which the value gets stored
   * @param {V} value - the value that has to be stored
   */
  setPop(key: Key, value: V) {
    if (this.freeMemory.length === this.capacity) this.freeMemory = [];
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
    if (this.size < this.capacity!) {
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

  private toTop(pointer: number) {
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

  /**
   * Resets the cache
   *
   */
  clear() {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.items = {};
    this.freeMemory = [];
    this.keys = [];
    this.values = [];
    this.backward = getTypedArray(this.capacity!);
    this.forward = getTypedArray(this.capacity!);
  }

  /**
   *  removes the specific entry
   *
   * @param {Key} key - the Key which you want to remove
   */
  remove(key: Key) {
    const pointer = this.items[key];
    this.freeMemory.push(pointer);
    this.keys[pointer] = undefined;
    this.values[pointer] = undefined;
    this.size--;
    delete this.items[key];
  }
  /**
   * Returns the value for a Key or undefined if the key was not found
   *
   * @param {Key} key - the Key for which you want a value
   */
  get(key: Key): V | undefined {
    const pointer = this.items[key];

    if (pointer === undefined) return undefined;

    this.toTop(pointer);

    return this.values[pointer];
  }

  /**
   * Returns the value for the given Key or undefined if the key was not found but the order does not change
   *
   * @param {Key} key - the Key for which you want a value
   */
  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    return this.values[pointer];
  }

  /**
   *  add array like forEach to the cache Object
   *
   * @param {(item: { key: Key; value: V }, index: number) => void} callback - method which gets called forEach Iteration
   */
  forEach(callback: (item: { value: V; key: Key }, index: number) => void) {
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
  /**
   * Checks if the Key is already in the cache
   *
   * @param {Key} key - the Key which you want to check
   */
  has(key: Key) {
    return this.items[key] ? true : false;
  }

  /**
   *  getter for the Keys stored in the Cache
   *
   * @readonly
   */
  get Keys() {
    return this.keys;
  }

  /**
   *  getter for the Values stored in the cache
   *
   * @readonly
   */
  get Values() {
    return this.values;
  }

  /**
   * getter for the current size of the cache
   *
   * @readonly
   */
  get Size() {
    return this.size;
  }
}
