import { getTypedArray, TypedArray } from "../utils/typedArray.ts";
import { PointerList } from "../utils/pointerList.ts";
import { Key } from "../models/cache.ts";
import { Policy } from "../models/policy.ts";
import { StatCounter } from "../models/stats.ts";
import { NoopCounter } from "../cache/stats/noopCounter.ts";

//TODO: delete single entry

/**
 * Second Chance Cache
 */
export class SC<K extends Key, V> implements Policy<K, V> {
  statCounter: StatCounter = new NoopCounter();
  private head: number;
  private tail: number;
  private arrayMap: {
    key: K | undefined;
    value: V | undefined;
    sChance: boolean;
  }[];
  private backward: TypedArray;
  private pointers: PointerList;
  private items: { [key in Key]: number };
  private _size: number;

  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.backward = getTypedArray(this.capacity);
    this.head = 0;
    this._size = 0;
    this.tail = 0;
    this.items = {};
    this.pointers = new PointerList(this.capacity);
    this.arrayMap = new Array(this.capacity);
  }

  set(key: K, value: V) {
    let pointer = this.items[key];
    if (pointer !== undefined) {
      this.arrayMap[pointer].value = value;
      this.arrayMap[pointer].sChance = true;
      this.statCounter.recordHit();
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

    this.statCounter.recordMiss();
  }

  get(key: K) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    this.arrayMap[pointer].sChance = true;
    return this.arrayMap[pointer].value;
  }

  peek(key: K) {
    const pointer = this.items[key];
    if (pointer === undefined) return undefined;
    return this.arrayMap[pointer].value;
  }

  forEach(callback: (item: { key: K; value: V }, index: number) => void) {
    this.arrayMap
      .filter((am) => am.key != undefined)
      .forEach((val, i) => {
        callback.call(this, { key: val.key!, value: val.value! }, i);
      });
  }

  *[Symbol.iterator]() {
    yield { key: this.arrayMap[0].key!, value: this.arrayMap[0].value };
  }

  clear() {
    this.backward = getTypedArray(this.capacity!);
    this.head = 0;
    this._size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
  }

  remove(key: K) {
    const pointer = this.items[key];
    this.pointers.remove(pointer);
    this.arrayMap[pointer].key = undefined;
    this.arrayMap[pointer].value = undefined;
    this.arrayMap[pointer].sChance = false;
    this._size--;
    delete this.items[key];
  }

  has(key: Key) {
    return this.items[key] !== undefined ? true : false;
  }

  get keys() {
    return this.arrayMap
      .filter((am) => am.key != undefined)
      .map((v) => v.key) as K[];
  }

  get values() {
    return this.arrayMap
      .filter((am) => am.key != undefined)
      .map((v) => v.value) as V[];
  }

  get size() {
    return this._size;
  }
}
