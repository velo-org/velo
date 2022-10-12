import { NoopCounter } from "../../cache/stats/noopCounter.ts";
import { Key } from "../../models/cache.ts";
import { Policy } from "../../models/policy.ts";
import { StatCounter } from "../../models/stats.ts";
import { PointerList } from "../../utils/pointer_list.ts";
import { FrequencySketch } from "./frequency_sketch.ts";

/**
 * Window-TinyLFU implementation as per https://dl.acm.org/citation.cfm?id=3149371
 * inspired by Caffeine's implementation: https://github.com/ben-manes/caffeine.
 *
 * A new cache entry is first placed into a small window cache and remains
 * there while it has high temporal locality (LRU). An entry that is evicted from
 * the window gets the chance to be inserted in main cache (SLRU). If the main cache
 * is full at that point, the TinyLFU admission policy picks between the windows'
 * and the main cache's eviction victim. TinyLFU determines the winner via a historic
 * frequency filter. Here a 4-bit CountMinSketch is emnployed for estimating the
 * frequency.
 *
 * In this implementation the total cache capacity is split into (1) the window LRU
 * cache with 1% of the total capacity, (2) the main SLRU cache with 99% of the
 * total capacity, which is again split into 80% for the hot/protected and 20% for
 * the cold/probationary part.
 */
export class WindowTinyLfu<K extends Key, V> implements Policy<K, V> {
  /**
   * A global cache entry map that maps entries to their segment and their 
   * local pointer inside that segment.
   */
  private entryMap: { [key in Key]: EntryIdent };
  private window: LruPointerList<K, V>;
  private protected: LruPointerList<K, V>;
  private probation: LruPointerList<K, V>;
  private filter: FrequencySketch<K>;

  readonly capacity: number;
  statCounter: StatCounter = new NoopCounter();

  constructor(capacity: number) {
    this.capacity = capacity;
    const maxWindow = 0.01 * capacity;
    const maxProtected = 0.8 * (capacity - maxWindow);
    const maxProbation = 0.2 * (capacity - maxWindow);
    this.window = new LruPointerList(maxWindow);
    this.protected = new LruPointerList(maxProtected);
    this.probation = new LruPointerList(maxProbation);
    this.filter = new FrequencySketch(capacity);
    this.entryMap = {};
  }

  get size() {
    return this.window.size() + this.protected.size() + this.probation.size();
  }

  get keys(): K[] {
    return [
      ...this.window.keys(),
      ...this.protected.keys(),
      ...this.probation.keys(),
    ];
  }

  get values(): V[] {
    return [
      ...this.window.values(),
      ...this.protected.values(),
      ...this.probation.values(),
    ];
  }

  set(key: K, value: V) {
    if (this.window.isFull()) {
      this.evict();
    }

    const ident = this.entryMap[key];

    if (ident) {
      // key in cache, just update the value
      switch (ident.segment) {
        case Segment.Window:
          return this.window.put(key, value);
        case Segment.Protected:
          return this.protected.put(key, value);
        case Segment.Probation:
          return this.probation.put(key, value);
      }
    } else {
      // insert into the windows MRU position
      this.entryMap[key] = {
        segment: Segment.Window,
        pointer: this.window.insertMru(key, value),
      };
    }
  }

  get(key: K) {
    this.filter.increment(key);
    const ident = this.entryMap[key];

    if (ident) {
      return this.onHit(ident);
    }

    this.statCounter.recordMiss();
    return undefined;
  }

  has(key: K): boolean {
    return this.entryMap[key] !== undefined;
  }

  peek(key: K): V | undefined {
    const ident = this.entryMap[key];
    if (ident) {
      return this.executeOnCache(ident, LruPointerList.prototype.get);
    }
    return undefined;
  }

  remove(key: K) {
    const ident = this.entryMap[key];
    if (ident) {
      this.executeOnCache(ident, LruPointerList.prototype.erase);
      delete this.entryMap[key];
    }
  }

  clear() {
    this.window.clear();
    this.protected.clear();
    this.probation.clear();
    this.entryMap = {};
  }

  forEach(callback: (item: { key: K; value: V }, index: number) => void) {
    this.window.forEach(0, callback);
    this.protected.forEach(this.window.size(), callback);
    this.probation.forEach(
      this.window.size() + this.protected.size(),
      callback
    );
  }

  *[Symbol.iterator]() {
    for (const entry of this.window) {
      yield entry;
    }
    for (const entry of this.protected) {
      yield entry;
    }
    for (const entry of this.probation) {
      yield entry;
    }
  }

  private onHit(ident: EntryIdent) {
    this.statCounter.recordHit();
    let value: V;
    switch (ident.segment) {
      case Segment.Window:
        value = this.window.get(ident.pointer);
        this.onWindowHit(ident.pointer);
        break;
      case Segment.Protected:
        value = this.protected.get(ident.pointer);
        this.onProtectedHit(ident.pointer);
        break;
      case Segment.Probation:
        value = this.probation.get(ident.pointer);
        this.onProbationHit(ident.pointer);
    }
    return value;
  }

  /**
   * Moves pointer to the window MRU position.
   */
  private onWindowHit(pointer: number) {
    this.window.toMru(pointer);
  }

  /**
   * Moves pointer to the protected MRU position.
   */
  private onProtectedHit(pointer: number) {
    this.protected.toMru(pointer);
  }

  /**
   * Promotes pointer to the protected MRU position. If the protected cache is full,
   * the LRU position of the protected cache is demoted to the probationary segment.
   */
  private onProbationHit(pointer: number) {
    const promoted = this.probation.remove(pointer);

    if (this.protected.isFull()) {
      const demoted = this.protected.removeLru();
      this.entryMap[demoted.key].segment = Segment.Probation;
      this.probation.insertMru(demoted.key, demoted.value);
    }

    this.protected.insertMru(promoted.key, promoted.value);
  }

  /**
   * Evicts an entry from the window cache into the main cache's probationary
   * segment, when the window cache is full.
   * If the probationary segment is full, the TinyLFU admission policy is applied.
   * Which chooses a winner between the window and main cache victim. The entry
   * with the worse frequency is evicted.
   */
  private evict() {
    this.statCounter.recordEviction();
    if (this.size >= this.capacity) {
      const windowVictimFreq = this.filter.frequency(this.window.getLruKey());
      const mainVictimFreq = this.filter.frequency(this.probation.getLruKey());
      if (windowVictimFreq > mainVictimFreq) {
        this.evictFromMain();
        this.transferFromWindowToMain();
      } else {
        this.evictFromWindow();
      }
    } else {
      this.transferFromWindowToMain();
    }
  }

  private evictFromWindow() {
    const key = this.window.evict();
    delete this.entryMap[key];
  }

  private evictFromMain() {
    const key = this.probation.evict();
    delete this.entryMap[key];
  }

  private transferFromWindowToMain() {
    const windowVictim = this.window.removeLru();
    this.probation.insertMru(windowVictim.key, windowVictim.value);
  }

  private executeOnCache(target: EntryIdent, fn: (p: number) => any) {
    switch (target.segment) {
      case Segment.Window:
        return fn.call(this.window, target.pointer);
      case Segment.Protected:
        return fn.call(this.window, target.pointer);
      case Segment.Probation:
        return fn.call(this.window, target.pointer);
    }
  }
}

interface EntryIdent {
  segment: Segment;
  pointer: number;
}

enum Segment {
  Window,
  Protected,
  Probation,
}

/**
 * A wrapper around {@link PointerList} that provides LRU cache semantics
 * explicitly as methods.
 */
class LruPointerList<K extends Key, V> {
  readonly capacity: number;

  private items: { [key in Key]: number };
  private pointers: PointerList;
  private _keys: Array<K>;
  private _values: Array<V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.pointers = new PointerList(capacity);
    this._keys = [];
    this._values = [];
    this.items = {};
  }

  keys() {
    return this._keys;
  }

  values() {
    return this._values;
  }

  size() {
    return this.pointers.size;
  }

  isFull() {
    return this.pointers.isFull();
  }

  get(pointer: number) {
    return this._values[pointer];
  }

  getLruKey() {
    return this._keys[this.pointers.back];
  }

  put(key: K, value: V) {
    const p = this.items[key];
    this._values[p] = value;
  }

  insertMru(key: K, value: V): number {
    const p = this.pointers.newPointer()!;
    this.pointers.pushFront(p);
    this._keys[p] = key;
    this._values[p] = value;
    return p;
  }

  toMru(pointer: number) {
    this.pointers.moveToFront(pointer);
  }

  erase(pointer: number) {
    this.pointers.remove(pointer);
    const key = this._keys[pointer];
    delete this.items[key];
  }

  removeLru() {
    const p = this.pointers.removeBack();
    const key = this._keys[p];
    delete this.items[key];
    return { key, value: this._values[p] };
  }

  remove(pointer: number) {
    this.pointers.remove(pointer);
    const key = this._keys[pointer];
    delete this.items[key];
    return { key, value: this._values[pointer] };
  }

  evict() {
    const p = this.pointers.removeBack();
    const key = this._keys[p];
    delete this.items[key];
    return key;
  }

  clear() {
    this.pointers.clear();
    this._keys = [];
    this._values = [];
    this.items = {};
  }

  forEach(
    startIndex: number,
    callback: (item: { key: K; value: V }, index: number) => void
  ) {
    let p: number | undefined = this.pointers.front;
    for (let i = startIndex; p !== undefined; i++) {
      callback({ key: this._keys[p], value: this._values[p] }, i);
      p = this.pointers.nextOf(p);
    }
  }

  *[Symbol.iterator]() {
    let p: number | undefined = this.pointers.front;
    for (let i = 0; p != undefined; i++) {
      yield { key: this._keys[p], value: this._values[p] };
      p = this.pointers.nextOf(p);
    }
  }
}
