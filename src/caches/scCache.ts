import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { getTypedArray } from '../utils/typedArray.ts';
import { Key } from '../models/key.ts';

/**
 *
 *
 * @export
 * @class SCChache
 * @extends {BaseCache}
 * @template V
 * @example
 * const scc = new SCChache({ maxCache: 5 }); // init Second Chance Cache with max 5 key-value pairs
 * scc.set('1', { hello: 'asdf' }); // sets 1
 * scc.set('2', { hello: 'asdf' }); // sets 2
 * scc.set('3', { hello: 'asdf' }); // sets 3
 * scc.set('4', { hello: 'asdf' }); // sets 4
 * scc.set('5', { hello: 'asdf' }); // sets 5
 * scc.get('1'); // gets 2 second Chance gets activated
 * scc.set('6', { hello: 'asdfdd' }); // sets 6 removes 2
 *
 * scc.set('7', { hello: 'asdfdd' }); // sets 7 remove 1
 */
export class SCChache<V = any> extends BaseCache {
  private head: number;
  private tail: number;
  private arrayMap: { key: Key; value: V; sChance: boolean }[];
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private items: { [key in Key]: number };
  private size: number;

  constructor(options: Options) {
    super(options);
    this.backward = getTypedArray(options.maxCache);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.maxCache);
  }

  set(key: Key, value: V) {
    let pointer = this.items[key];
    if (pointer) {
      this.arrayMap[pointer].value = value;
      this.arrayMap[pointer].sChance = true;
      return;
    }

    if (this.size < this.maxCache) {
      pointer = this.size++;
      this.items[key] = pointer;
      this.arrayMap[this.size - 1] = { key, value, sChance: false };

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

  get(key: string) {
    const pointer = this.items[key];
    this.arrayMap[pointer].sChance = true;
    return this.arrayMap[pointer];
  }

  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    this.arrayMap.forEach((val, i) => {
      callback.call(this, { key: val.key, value: val.value }, i);
    });
  }

  has(key: Key) {
    return this.items[key] ? true : false;
  }

  get Keys() {
    return this.arrayMap.map((v) => v.key);
  }

  get Values() {
    return this.arrayMap.map((v) => v.value);
  }

  get Size() {
    return this.size;
  }
}
