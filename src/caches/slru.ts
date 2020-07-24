import { BaseCache } from './base.ts';
import { LRU } from './lru.ts';
import { SLRUOptions } from '../models/slruOptions.ts';
import { Key } from '../models/key.ts';
import { Cache } from '../models/Cache.ts';

export class SLRU<V = any> extends BaseCache implements Cache<V> {
  private protectedPartition: LRU<V>;
  private probationaryPartition: LRU<V>;
  private items: { [key in Key]: V };
  private protectedCache: number;
  private probationaryCache: number;

  constructor(options: SLRUOptions) {
    super({ capacity: options.probationaryCache + options.protectedCache });
    this.protectedCache = options.protectedCache;
    this.probationaryCache = options.probationaryCache;
    this.protectedPartition = new LRU<V>({
      capacity: this.protectedCache,
    });
    this.probationaryPartition = new LRU<V>({
      capacity: this.probationaryCache,
    });
    this.items = {};
  }

  set(key: Key, value: V) {
    this.probationaryPartition.set(key, value);
  }

  get(key: Key) {
    const cObjectProtected = this.protectedPartition.get(key);
    const cObjectProbationary = this.probationaryPartition.peek(key);
    if (!cObjectProtected && !cObjectProbationary) return undefined;
    if (cObjectProtected) return cObjectProtected;
    else {
      const cObject = this.protectedPartition.setPop(key, cObjectProbationary!);
      if (!cObject) {
        this.probationaryPartition.remove(key);
        return cObjectProbationary!;
      }
      this.probationaryPartition.set(key, cObject.value!);
      return cObjectProbationary;
    }
  }
  /**
   *  add array like forEach to the cache Object
   *
   * @param {(item: { key: Key; value: V }, index: number) => void} callback - method which gets called forEach Iteration
   */
  forEach(callback: (item: { value: V; key: Key }, index: number) => void) {
    this.protectedPartition.forEach(callback);
    this.probationaryPartition.forEach(callback);
  }

  peek(key: Key) {
    return this.probationaryPartition.peek(key)
      ? this.probationaryPartition.peek(key)
      : this.protectedPartition.peek(key);
  }

  has(key: Key) {
    return this.probationaryPartition.has(key)
      ? true
      : this.protectedPartition.has(key);
  }

  get ProtectedPartition() {
    return this.protectedPartition;
  }

  get PropationaryPartition() {
    return this.probationaryPartition;
  }

  get size() {
    return this.probationaryPartition.Size + this.ProtectedPartition.Size;
  }

  get keys() {
    return [];
  }

  get values() {
    return [];
  }

  clear() {
    this.probationaryPartition.clear();
    this.protectedPartition.clear();
  }
  /**
   *  removes the specific entry
   *
   * @param {Key} key - the Key which you want to remove
   */
  remove(key: Key) {
    const propationaryObj = this.probationaryPartition.peek(key);
    const protectedObj = this.protectedPartition.peek(key);
    if (!propationaryObj && !protectedObj) throw new Error('Key not found');
    else if (propationaryObj) {
      this.probationaryPartition.remove(key);
    } else {
      this.protectedPartition.remove(key);
    }
  }
}
