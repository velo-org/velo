import { BaseCache } from "./base.ts";
import { Options } from "../models/options.ts";
import { getTypedArray, TypedArray } from "../utils/typedArray.ts";
import { Key } from "../models/key.ts";
import { PointerList } from "../utils/pointerList.ts";

//TODO: delete single entry

/**
 * Second Chance Cache
 */
export class SC<V = any> extends BaseCache<V> {
  private head: number;
  private tail: number;
  private arrayMap: {
    key: Key | undefined;
    value: V | undefined;
    sChance: boolean;
  }[];
  private backward: TypedArray;
  private pointers: PointerList;
  private items: { [key in Key]: number };
  private _size: number;

  constructor(options: Options) {
    super(options);
    this.backward = getTypedArray(this.capacity);
    this.head = 0;
    this._size = 0;
    this.tail = 0;
    this.items = {};
    this.pointers = new PointerList(this.capacity);
    this.arrayMap = new Array(this.capacity);
  }

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   * @param ttl The max time to live in ms
   */
  set(key: Key, value: V, ttl?: number) {
    this.applyTTL(key, ttl);
    this.applySetEvent(key, value);

    let pointer = this.items[key];
    if (pointer !== undefined) {
      this.arrayMap[pointer].value = value;
      this.arrayMap[pointer].sChance = true;
      this._stats.hits++;
      return;
    }

    if (this._size < this.capacity!) {
      pointer = this._size++;
      if (!this.pointers.isFull()) {
        pointer = this.pointers.newPointer()!;
      }
      this.items[key] = pointer;
      this.arrayMap[pointer] = { key, value, sChance: false };

      // Moving the item at the end of the list
      this.pointers.pushBack(pointer);
    } else {
      let p = this.pointers.front;
      let found = false;
      for (let i = 0; p != undefined; i++) {
        if (!this.arrayMap[p].sChance) {
          delete this.items[this.arrayMap[p].key!];
          this.items[key] = p;
          this.arrayMap[p] = { key, value, sChance: false };
          this.pointers.moveToBack(p);
          found = true;
          break;
        }
        this.arrayMap[i].sChance = false;
        p = this.pointers.nextOf(p)!;
      }
      if (!found) {
        delete this.items[this.arrayMap[this.pointers.front].key!];
        this.items[key] = this.pointers.front;
        this.arrayMap[this.pointers.front] = { key, value, sChance: false };
        this.pointers.moveToBack(this.pointers.front);
      }
    }

    this._stats.misses++;
  }

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    this.arrayMap[pointer].sChance = true;
    return this.arrayMap[pointer].value;
  }

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    return this.arrayMap[pointer].value;
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    this.arrayMap
      .filter((am) => am.key != undefined)
      .forEach((val, i) => {
        callback.call(this, { key: val.key!, value: val.value! }, i);
      });
  }

  /**
   * Reset the cache
   */
  clear() {
    this.backward = getTypedArray(this.capacity!);
    this.head = 0;
    this._size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
    this.applyClearEvent();
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    const pointer = this.items[key];
    this.pointers.remove(pointer);
    this.applyRemoveEvent(key, this.arrayMap[pointer].value!);
    this.arrayMap[pointer].key = undefined;
    this.arrayMap[pointer].value = undefined;
    this.arrayMap[pointer].sChance = false;
    this._size--;
    delete this.items[key];
  }

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: Key) {
    return this.items[key] !== undefined ? true : false;
  }

  /**
   * List of keys in the cache
   */
  get keys() {
    return this.arrayMap.filter((am) => am.key != undefined).map((v) => v.key);
  }

  /**
   * List of values in the cache
   */
  get values() {
    return this.arrayMap
      .filter((am) => am.key != undefined)
      .map((v) => v.value);
  }

  /**
   * Current number of entries in the cache
   */
  get size() {
    return this._size;
  }
}
