import { BaseCache } from './base.ts';
import { LRU } from './lru.ts';
import { SLRUOptions } from '../models/slruOptions.ts';
import { Key } from '../models/key.ts';
/**
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Segmented_LRU_(SLRU)
 *
 * SLRU cache is divided into two segments, a probationary segment and a protected segment. Lines in each segment are ordered from the most to the least recently accessed. Data from misses is added to the cache at the most recently accessed end of the probationary segment. Hits are removed from wherever they currently reside and added to the most recently accessed end of the protected segment.
 *
 * @example
 *
 * ```ts
 * import {SLRU} from "https://deno.land/x/velo/mod.ts"
 *
 * const slruc = new SLRU({ protectedCache: 5, probationaryCache: 5 }); // inits a Segmented Least Recently Used Cache with max 5 key-value pairs
 * slruc.set('1', { hello: 'asdf' }); // sets 1
 * slruc.set('2', { hello: 'asdf' }); // sets 2
 * slruc.set('3', { hello: 'asdf' }); // sets 3
 * slruc.set('4', { hello: 'asdf' }); // sets 4
 * slruc.set('5', { hello: 'asdf' }); // sets 5
 * slruc.get('1') // returns value for key 1 adds 1 to the protected segment
 * slruc.set('6', { hello: 'asdfdd' }); // sets 6
 *
 * ```
 */
export class SLRU<V = any> extends BaseCache {
  private protectedPartition: LRU<V>;
  private probationaryPartition: LRU<V>;
  private items: { [key in Key]: V };
  private protectedCache: number;
  private probationaryCache: number;

  constructor(options: SLRUOptions) {
    super(options);
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

  /**
   * Sets a Value with the corresponding Key
   *
   * @param {Key} key - the key for which the value gets stored
   * @param {V} value - the value that has to be stored
   */
  set(key: Key, value: V) {
    this.probationaryPartition.set(key, value);
  }

  /**
   * Returns the value for a Key or undefined if the key was not found
   *
   * @param {Key} key - the Key for which you want a value
   */
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
  /**
   * Returns the value for the given Key or undefined if the key was not found but the order does not change
   *
   * @param {Key} key - the Key for which you want a value
   */
  peek(key: Key) {
    return this.probationaryPartition.peek(key)
      ? this.probationaryPartition.peek(key)
      : this.protectedPartition.peek(key);
  }
  /**
   * Checks if the Key is already in the cache
   *
   * @param {Key} key - the Key which you want to check
   */
  has(key: Key) {
    return this.probationaryPartition.has(key)
      ? true
      : this.protectedPartition.peek(key);
  }

  /**
   *  getter for the protected Partition of the cache
   *
   * @readonly
   */
  get ProtectedPartition() {
    return this.protectedPartition;
  }
  /**
   *  getter for the probationary Partition of the cache
   *
   * @readonly
   */
  get PropationaryPartition() {
    return this.probationaryPartition;
  }

  /**
   * getter for the current size of the cache
   *
   * @readonly
   */
  get Size() {
    return this.probationaryPartition.Size + this.ProtectedPartition.Size;
  }

  /**
   * Resets the cache
   *
   */
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
