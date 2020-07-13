import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { TypedArray } from '../utils/typedArray.ts';

type keyType = number | string;

export class SCChache<V = any> extends BaseCache {
  private head: number;
  private tail: number;
  private arrayMap: { key: keyType; value: V; sChance: boolean }[];
  private backward: Float64Array | Uint8Array | Uint16Array | Uint32Array;
  private items: { [key in keyType]: number };
  private size: number;

  constructor(options: Options) {
    super(options);
    const PointerArray = TypedArray.getPointerArray(options.maxCache);
    this.backward = new PointerArray(options.maxCache);
    this.head = 0;
    this.size = 0;
    this.tail = 0;
    this.items = {};
    this.arrayMap = new Array(this.maxCache);
  }

  set(key: keyType, value: V) {
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
  forEach(callback: (item: { key: keyType; value: V }, index: number) => void) {
    this.arrayMap.forEach((val, i) => {
      callback.call(this, { key: val.key, value: val.value }, i);
    });
  }
  has(key: keyType) {
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
