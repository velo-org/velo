import { PointerList } from "../utils/pointer_list.ts";
import { Key } from "../cache/key.ts";
import { Policy } from "./policy.ts";

/**
 * Second Chance (SC)
 */
export class SecondChance<K extends Key, V> implements Policy<K, V> {
  private arrayMap: SecondChanceEntry<K, V>[];
  private pointers: PointerList;
  private items: { [key in Key]: number };
  private _size: number;

  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this._size = 0;
    this.items = {};
    this.pointers = new PointerList(this.capacity);
    this.arrayMap = new Array(this.capacity);
  }

  set(key: K, value: V) {
    let pointer: number = this.items[key];
    if (pointer !== undefined) {
      this.arrayMap[pointer].value = value;
      this.arrayMap[pointer].sChance = true;
      return;
    }

    if (this._size < this.capacity!) {
      pointer = this._size++;
      if (!this.pointers.isFull()) {
        pointer = this.pointers.newPointer();
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
  }

  get(key: K) {
    const pointer = this.items[key];
    if (pointer === undefined) {
      return undefined;
    }
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

  clear() {
    this._size = 0;
    this.items = {};
    this.arrayMap = new Array(this.capacity);
  }

  remove(key: K) {
    const pointer = this.items[key];
    this.pointers.remove(pointer);
    delete this.arrayMap[pointer];
    this._size--;
    delete this.items[key];
  }

  has(key: Key) {
    return this.items[key] !== undefined;
  }

  get keys() {
    return this.arrayMap.filter((am) => am.key != undefined).map((v) => v.key) as K[];
  }

  get values() {
    return this.arrayMap.filter((am) => am.key != undefined).map((v) => v.value) as V[];
  }

  get size() {
    return this._size;
  }
}

interface SecondChanceEntry<K, V> {
  key: K;
  value: V;
  sChance: boolean;
}
