import { Key } from "../../cache/key.ts";
import { nextPowerOfTwo } from "../../utils/next_power_of_two.ts";
import { hash as hashFunction } from "./hash_function.ts";
/**
 * A probabilistic set for estimating the frequency of elements within a time
 * window to use as _freshness_ metric for the TinyLFU [1] admission policy.
 * Employing a Count-Min Sketch[2] where the counter matrix is represented by
 * an array with `length=width*depth`. Width is at least the given capacity of
 * the cache for accuracy, but is increased to the next power of two. The depth
 * is 4 by default.
 *
 * The frequency of all entries is aged periodically using a sampling window
 * based on the maximum number of entries in the cache. This is referred to as
 * the reset operation by TinyLfu and keeps the sketch fresh by dividing all
 * counters by two.
 *
 * - [1] TinyLFU: A Highly Efficient Cache Admission Policy
 * https://dl.acm.org/citation.cfm?id=3149371
 * - [2] An Improved Data Stream Summary: The Count-Min Sketch and its Applications
 * http://dimacs.rutgers.edu/~graham/pubs/papers/cm-full.pdf
 */
export class FrequencySketch<T extends Key> {
  /**
   * The widthXdepth matrix of counters represented as an array.
   */
  private table: Uint8Array;
  private size: number;
  private resetSize: number;
  private width: number;
  private depth: number;
  private maxFrequency = 15;

  constructor(capacity: number, depth: number = 4) {
    const safeMax = Math.min(capacity, Number.MAX_SAFE_INTEGER >>> 2);
    this.width = nextPowerOfTwo(safeMax);
    this.depth = depth;
    this.size = 0;
    this.resetSize = this.width * 10;
    this.table = new Uint8Array(this.width * this.depth);
  }

  contains(hash: number) {
    return this.frequency(hash) > 0;
  }

  /**
   * Returns the estimated frequency of the given item. Up to a maximum.
   */
  frequency(hash: number) {
    let frequency = Number.MAX_SAFE_INTEGER;
    const counterHash = this.rehash(hash);
    for (let i = 0; i < this.depth; i++) {
      frequency = Math.min(frequency, this.table[this.tableIndex(hash, counterHash, i)]);
    }

    return frequency;
  }

  /**
   * Increments popularity of given item up to a maximum.
   * Downsamples popularity if a certain threshold is reached.
   */
  increment(hash: number) {
    const counterHash = this.rehash(hash);
    let wasIncremented = false;
    for (let i = 0; i < this.depth; i++) {
      wasIncremented = this.tryIncrementCounterAt(hash, counterHash, i) || wasIncremented;
    }

    if (wasIncremented && ++this.size >= this.resetSize) {
      this.reset();
    }
  }

  hash(item: T) {
    return hashFunction(item);
  }

  private rehash(a0: number) {
    let a = a0 ^ 61 ^ (a0 >>> 16);
    a = a + (a << 3);
    a = a ^ (a >>> 4);
    a = a * 0x27d4eb2d;
    a = a ^ (a >>> 15);
    return a;
  }

  /**
   * Halves every counter and sets new size
   */
  private reset() {
    for (let i = 0; i < this.table.length; i++) {
      this.table[i] = Math.floor(this.table[i] >>> 1);
    }
    this.size /= 2;
  }

  /**
   * Returns the table index associated with the given hash and depth index.
   */
  private tableIndex(hash: number, cHash: number, depthIndex: number) {
    const h = hash + cHash * depthIndex;
    return depthIndex * this.width + (h & (this.width - 1));
  }

  /**
   * Increments counter if it is not already at maximum.
   * Returns true if the counter was incremented, false otherwise.
   */
  private tryIncrementCounterAt(hash: number, cHash: number, depthIndex: number) {
    const index = this.tableIndex(hash, cHash, depthIndex);

    // maximum reached
    if (this.table[index] >= this.maxFrequency) {
      return false;
    }

    // increment counter
    this.table[index] += 1;
    return true;
  }
}
