import { BaseCache } from './baseCache.ts';
import { LRUCache } from './lruCache.ts';
import { SLRUOptions } from '../models/slruOptions.ts';
import { Key } from '../models/key.ts';

//TODO: delete single entry

export class SLRUCache<V = any> extends BaseCache {
  protectedPartition: LRUCache<V>;
  probationaryPartition: LRUCache<V>;
  size: number;
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
    this.size = 0;
  }

  set(key: Key, value: V) {
    this.probationaryPartition.set(key, value);
    this.size++;
  }
  get(key: Key) {
    const cObjectProtected = this.protectedPartition.get(key);
    const cObjectProbationary = this.probationaryPartition.peek(key);
    if (!cObjectProtected && !cObjectProbationary) return undefined;
    if (cObjectProtected) return cObjectProtected;
    else {
      const cObject = this.protectedPartition.setPop(key, cObjectProbationary!);
      if (!cObject) {
        this.size++;
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
}
