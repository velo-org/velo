import { BaseCache } from './baseCache.ts';
import { LRUCache } from './lruCache.ts';
import { SLRUOptions } from '../models/slruOptions.ts';
import { Key } from '../models/key.ts';

export class SLRUCache<V = any> extends BaseCache {
  protectedPartition: LRUCache<V>;
  probationaryPartition: LRUCache<V>;
  items: { [key in Key]: V };
  protectedCache: number;
  probationaryCache: number;

  constructor(options: SLRUOptions) {
    super(options);
    this.protectedCache = options.protectedCache;
    this.probationaryCache = options.probationaryCache;
    this.protectedPartition = new LRUCache<V>({
      maxCache: this.protectedCache,
    });
    this.probationaryPartition = new LRUCache<V>({
      maxCache: this.probationaryCache,
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
        return cObjectProbationary!;
      }
      this.probationaryPartition.set(key, cObject.value!);
      return cObjectProbationary;
    }
  }

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
      : this.protectedPartition.peek(key);
  }
  get ProtectedPartition() {
    return this.protectedPartition;
  }
  get PropationaryPartition() {
    return this.probationaryPartition;
  }

  get Size() {
    return this.probationaryPartition.Size + this.ProtectedPartition.Size;
  }

  clear() {
    this.probationaryPartition.clear();
    this.protectedPartition.clear();
  }

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
