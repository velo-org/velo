import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';
import { PointerList } from '../utils/pointerList.ts';

export class LRUCache<V = any> extends BaseCache {
  private keys: (string | number | undefined)[];
  private values: Array<V>;
  private items: { [key in Key]: number };
  pointers: PointerList;

  constructor(options: Options) {
    super(options);
    this.items = {};
    this.keys = new Array(this.capacity);
    this.values = new Array(this.capacity);
    this.pointers = new PointerList(this.capacity);
  }

  set(key: Key, value: V) {
    let pointer = this.items[key];

    if (pointer) {
      this.pointers.moveToFront(pointer);
      this.values[pointer] = value;

      return;
    }

    // The cache is not yet full
    if (this.pointers.size < this.capacity) {
      pointer = this.pointers.size;
    }

    // Cache is full, we need to drop the last value
    else {
      this.pointers.removeBack();
      delete this.items[this.keys[pointer]!];
      pointer = this.pointers.size;
    }

    // Storing key & value
    this.items[key] = pointer;
    this.keys[pointer] = key;
    this.values[pointer] = value;

    this.pointers.pushFront(pointer);
  }

  clear() {
    this.items = {};
    this.keys = [];
    this.values = [];
  }

  remove(key: Key) {
    const pointer = this.items[key];
    this.keys[pointer] = undefined;
    delete this.items[key];
  }

  get(key: Key): V | undefined {
    const pointer = this.items[key];

    if (pointer === undefined) return;

    this.pointers.moveToFront(pointer);

    return this.values[pointer];
  }

  peek(key: Key) {
    const pointer = this.items[key];
    if (pointer === undefined) return;
    return this.values[pointer];
  }

  forEach(
    callback: (item: V, index: number) => void,
    reverse: boolean = false
  ) {
    let p: number | undefined = this.pointers.nextPointer(this.pointers.root);

    for (
      let i = reverse ? this.pointers.size : 0;
      p !== undefined;
      reverse ? i-- : i++
    ) {
      callback(this.values[p], i);
      p = this.pointers.nextPointer(p);
    }
  }
}
