import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

//TODO: delete single entry

/**
 * https://www.geeksforgeeks.org/second-chance-or-clock-page-replacement-policy/
 *
 *  In the Second Chance page replacement policy, the candidate pages for removal are considered in a round robin matter, and a page that has been accessed between consecutive considerations will not be replaced. The page replaced is the one that, when considered in a round robin matter, has not been accessed since its last consideration.
 *
 * @example
 * ```ts
 * import {SC} from "https://deno.land/x/velo/mod.ts"
 *
 * const scc = new SC({ capacity: 5 }); // init Second Chance Cache with max 5 key-value pairs
 * scc.set('1', { hello: 'asdf' }); // sets 1
 * scc.set('2', { hello: 'asdf' }); // sets 2
 * scc.set('3', { hello: 'asdf' }); // sets 3
 * scc.set('4', { hello: 'asdf' }); // sets 4
 * scc.set('5', { hello: 'asdf' }); // sets 5
 * scc.get('1'); // gets 2 second Chance gets activated
 * scc.set('6', { hello: 'asdfdd' }); // sets 6 removes 2
 *
 * scc.set('7', { hello: 'asdfdd' }); // sets 7 remove 1
 * ```
 */
export class SC<V = any> extends BaseCache {
  private head: number;
  private tail: number;
  private arrayMap: { key: Key; value: V; sChance: boolean }[];
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private items: { [key in Key]: number };
  private size: number;

  constructor(options: Options) {
    super(options);
    if (!this.capacity) throw new Error('Please provide a Maximum Cache');
    this.backward = getTypedArray(this.capacity);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
  }
  /**
   * Sets a Value with the corresponding Key
   *
   * @param {Key} key - the key for which the value gets stored
   * @param {V} value - the value that has to be stored
   */
  set(key: Key, value: V) {
    let pointer = this.items[key];
    if (pointer !== undefined) {
      this.arrayMap[pointer].value = value;
      this.arrayMap[pointer].sChance = true;
      return;
    }

    if (this.size < this.capacity!) {
      pointer = this.size++;
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
  /**
   * Returns the value for a Key or undefined if the key was not found
   *
   * @param {Key} key - the Key for which you want a value
   */
  get(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    this.arrayMap[pointer].sChance = true;
    return this.arrayMap[pointer].value;
  }
  /**
   * Returns the value for the given Key or undefined if the key was not found but the order does not change
   *
   * @param {Key} key - the Key for which you want a value
   */
  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    return this.arrayMap[pointer];
  }
  /**
   *  add array like forEach to the cache Object
   *
   * @param {(item: { key: Key; value: V }, index: number) => void} callback - method which gets called forEach Iteration
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    this.arrayMap.forEach((val, i) => {
      callback.call(this, { key: val.key, value: val.value }, i);
    });
  }
  /**
   * Resets the cache
   *
   */
  clear() {
    this.backward = getTypedArray(this.capacity!);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
  }
  /**
   *  removes the specific entry
   *
   * @param {Key} key - the Key which you want to remove
   */
  remove(key: Key) {
    const pointer = this.items[key];
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
    return this.arrayMap.map((v) => v.key);
  }
  /**
   *  getter for the Values stored in the cache
   *
   * @readonly
   */
  get Values() {
    return this.arrayMap.map((v) => v.value);
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
