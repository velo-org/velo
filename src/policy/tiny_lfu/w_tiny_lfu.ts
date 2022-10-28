import { RemoveCause, RemoveListener } from "../../cache/capabilities/remove_listener_capability.ts";
import { Key } from "../../cache/key.ts";
import { PointerList } from "../../utils/pointer_list.ts";
import { Policy } from "../policy.ts";
import { FrequencySketch } from "./frequency_sketch.ts";

interface EntryIdent {
  segment: Segment;
  hash: number;
  pointer: number;
}

enum Segment {
  Window,
  Protected,
  Probation,
}

/**
 * Window-TinyLFU (W-TinyLFU) implementation as per https://dl.acm.org/citation.cfm?id=3149371
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
  onEvict?: RemoveListener<K, V>;

  readonly capacity: number;

  constructor(capacity: number) {
    if (capacity < 100) {
      throw new Error("TinyLFU requires capacity >= 100");
    }
    this.capacity = capacity;
    const maxWindow = Math.ceil(0.01 * capacity);
    const maxProtected = Math.floor(0.8 * (capacity - maxWindow));
    const maxProbation = Math.ceil(0.2 * (capacity - maxWindow));
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
    return [...this.window.keys(), ...this.protected.keys(), ...this.probation.keys()];
  }

  get values(): V[] {
    return [...this.window.values(), ...this.protected.values(), ...this.probation.values()];
  }

  set(key: K, value: V) {
    if (this.window.isFull()) {
      this.evict();
    }

    const ident: EntryIdent = this.entryMap[key];
    if (ident !== undefined) {
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
        hash: this.filter.hash(key),
      };
    }
  }

  get(key: K) {
    const ident = this.entryMap[key];

    if (ident) {
      this.filter.increment(ident.hash);
      return this.onHit(ident);
    }

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
      const oldEntry = this.executeOnCache(ident, LruPointerList.prototype.remove);
      delete this.entryMap[key];
      return oldEntry.value as V;
    }
    return undefined;
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
    this.probation.forEach(this.window.size() + this.protected.size(), callback);
  }

  private onHit(ident: EntryIdent) {
    const value: V = this.executeOnCache(ident, LruPointerList.prototype.get);
    switch (ident.segment) {
      case Segment.Window:
        this.onWindowHit(ident.pointer);
        break;
      case Segment.Protected:
        this.onProtectedHit(ident.pointer);
        break;
      case Segment.Probation:
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
      this.entryMap[demoted.key].pointer = this.probation.insertMru(demoted.key, demoted.value);
    }

    this.entryMap[promoted.key].segment = Segment.Protected;
    this.entryMap[promoted.key].pointer = this.protected.insertMru(promoted.key, promoted.value);
  }

  /**
   * Evicts an entry from the window cache into the main cache's probationary
   * segment, when the window cache is full.
   * If the probationary segment is full, the TinyLFU admission policy is applied.
   * Which chooses a winner between the window and main cache victim. The entry
   * with the worse frequency is evicted.
   */
  private evict() {
    if (this.size >= this.capacity) {
      const windowVictimFreq = this.filter.frequency(this.entryMap[this.window.getLruKey()].hash);
      const mainVictimFreq = this.filter.frequency(this.entryMap[this.protected.getLruKey()].hash);
      if (windowVictimFreq > mainVictimFreq) {
        this.evictFromMain();
        this.transferFromWindowToMain();
      } else {
        this.evictFromWindow();
      }
    } else {
      if (this.probation.isFull()) {
        this.evictFromMain();
      }
      this.transferFromWindowToMain();
    }
  }

  private evictFromWindow() {
    const key = this.window.evict(this.onEvict);
    delete this.entryMap[key];
  }

  private evictFromMain() {
    const key = this.probation.evict(this.onEvict);
    delete this.entryMap[key];
  }

  private transferFromWindowToMain() {
    const windowVictim = this.window.removeLru();
    this.entryMap[windowVictim.key].segment = Segment.Probation;
    this.entryMap[windowVictim.key].pointer = this.probation.insertMru(windowVictim.key, windowVictim.value);
  }

  /**
   * Executes a function on the cache segment that the entry belongs to. Passes
   * the entries pointer to the function.
   */
  // deno-lint-ignore no-explicit-any
  private executeOnCache(target: EntryIdent, fn: (p: number) => any) {
    switch (target.segment) {
      case Segment.Window:
        return fn.call(this.window, target.pointer);
      case Segment.Protected:
        return fn.call(this.protected, target.pointer);
      case Segment.Probation:
        return fn.call(this.probation, target.pointer);
    }
  }
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
    return this._keys.filter((k) => k !== undefined);
  }

  values() {
    return this._values.filter((v) => v !== undefined);
  }

  size() {
    return this.pointers.size;
  }

  isFull() {
    return this.pointers.isFull();
  }

  isEmpty() {
    return this.pointers.size === 0;
  }

  get(pointer: number) {
    return this._values[pointer];
  }

  getLruKey() {
    return this._keys[this.pointers.back];
  }

  put(key: K, value: V) {
    const p: number = this.items[key];
    const oldValue = this._values[p];
    this._values[p] = value;
    return oldValue;
  }

  insertMru(key: K, value: V): number {
    const p = this.pointers.newPointer();
    this.pointers.pushFront(p);
    this._keys[p] = key;
    this._values[p] = value;
    this.items[key] = p;
    return p;
  }

  toMru(pointer: number) {
    this.pointers.moveToFront(pointer);
  }

  removeLru() {
    const p = this.pointers.removeBack();
    const key = this._keys[p];
    const value = this._values[p];
    delete this.items[key];
    delete this._keys[p];
    delete this._values[p];
    return { key, value };
  }

  remove(pointer: number) {
    this.pointers.remove(pointer);
    const key = this._keys[pointer];
    const value = this._values[pointer];
    delete this.items[key];
    delete this._keys[pointer];
    delete this._values[pointer];
    return { key, value };
  }

  evict(onEvict?: RemoveListener<K, V>) {
    const p = this.pointers.removeBack();
    const key = this._keys[p];
    if (onEvict) {
      onEvict(key, this._values[p], RemoveCause.Evicted);
    }
    delete this.items[key];
    delete this._keys[p];
    delete this._values[p];
    return key;
  }

  clear() {
    this.pointers.clear();
    this._keys = [];
    this._values = [];
    this.items = {};
  }

  forEach(startIndex: number, callback: (item: { key: K; value: V }, index: number) => void) {
    if (this.isEmpty()) {
      return;
    }
    let p: number | undefined = this.pointers.front;
    for (let i = startIndex; p !== undefined; i++) {
      callback({ key: this._keys[p], value: this._values[p] }, i);
      p = this.pointers.nextOf(p);
    }
  }

  *[Symbol.iterator]() {
    if (this.isEmpty()) {
      return;
    }
    let p: number | undefined = this.pointers.front;
    for (let i = 0; p !== undefined; i++) {
      yield { key: this._keys[p], value: this._values[p] };
      p = this.pointers.nextOf(p);
    }
  }
}
