import { BaseCache } from './baseCache.ts';
import { Options } from '../models/options.ts';
import { TypedArray } from '../utils/typedArray.ts';

type keyType = number | string;

export class SCChache<V = any> extends BaseCache {
  private head: number;
  private tail: number;
  private arrayMap: { key: keyType; value: V; sChance: boolean }[];
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
    this.arrayMap = [];
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
      this.forward[this.head] = pointer;
      this.backward[this.tail] = pointer;
      this.forward[pointer] = this.tail;
      this.backward[pointer] = this.head;
      this.tail = pointer;
    } else {
      let i = this.backward[this.tail];
      while (i != this.tail) {
        if (!this.arrayMap[i].sChance) {
          delete this.items[this.arrayMap[i].key];
          this.items[key] = i;
          this.arrayMap[i] = { key, value, sChance: false };
          this.toBottom(i);
          break;
        }
        this.arrayMap[i].sChance = false;
        i = this.backward[i];
      }
    }
  }
  private toBottom(pointer: number) {
    if (this.tail === pointer) return;

    let oldTail = this.tail;
    const previous = this.backward[pointer],
      next = this.forward[pointer];

    if (this.head === pointer) {
      this.head = previous;
    } else {
      this.forward[previous] = next;
    }

    this.backward[next] = previous;

    this.backward[oldTail] = pointer;
    this.tail = pointer;
    this.backward[pointer] = this.head;

    return;
  }
  get(key: string) {
    const pointer = this.items[key];
    this.arrayMap[pointer].sChance = true;
    return this.arrayMap[pointer];
  }
  //   forEach(callback: (item: { key: keyType; value: V }, index: number) => void) {
  //     this.keys.forEach((key, i) => {
  //       callback.call(this, { key, value: this.values[i] }, i);
  //     });
  //   }
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
