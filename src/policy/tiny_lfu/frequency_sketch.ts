import { Key } from "../../models/cache.ts";

/**
 * A probabilistic set for estimating the frequency of elements within a time
 * window to use as _freshness_ metric for the TinyLFU [1] admission policy.
 *
 * The maximum frequency is 15. Employing a 4-bit Count-Min Sketch[2].
 * The counter matrix is implemented as a single 2d array, holding 16
 * counters per index. Length of the array is at least the capacity of the cache
 * for accuracy, but is increased to the next power of two. The depth is fixed
 * to 4.
 *
 * The frequency of all entries is aged periodically using a sampling window
 * based on the maximum number of entries in the cache. This is referred to as
 * the reset operation by TinyLfu and keeps the sketch fresh by dividing all
 * counters by two and subtracting based on the number of odd counters found.
 *
 * - [1] TinyLFU: A Highly Efficient Cache Admission Policy
 * https://dl.acm.org/citation.cfm?id=3149371
 * - [2] An Improved Data Stream Summary: The Count-Min Sketch and its Applications
 * http://dimacs.rutgers.edu/~graham/pubs/papers/cm-full.pdf
 */
export class FrequencySketch<T extends Key> {
  private table: Array<number[]> = new Array(8);
  private size = 0;
  private samplingSize = 0;
  private readonly thresholdFactor = 10;

  constructor(capacity: number) {
    this.changeCapacity(capacity);
  }

  changeCapacity(capacity: number) {
    const maximum = Math.min(capacity, Number.MAX_SAFE_INTEGER >>> 2);
    this.table = new Array(Math.max(this.nextPowerOfTwo(maximum), 8));
    for (let i = 0; i < this.table.length; i++) {
      this.table[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    this.size = 0;
    this.samplingSize = this.table.length * this.thresholdFactor;
  }

  contains(item: T) {
    return this.frequency(item) > 0;
  }

  /**
   * Returns the estimated frequency of the given item. Up to a maximum of 15.
   */
  frequency(item: T) {
    const hash = this.hash(item);
    let frequency = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < 4; i++) {
      frequency = Math.min(frequency, this.getCount(hash, i));
    }

    return frequency;
  }

  /**
   * Increments popularity of given item up to a maximum of 15.
   * Downsamples popularity if a certain threshold is reached.
   */
  increment(item: T) {
    const hash = this.hash(item);
    let wasIncremented = false;

    for (let i = 0; i < 4; i++) {
      wasIncremented = this.tryIncrementCounterAt(hash, i) || wasIncremented;
    }

    if (wasIncremented && ++this.size >= this.samplingSize) {
      this.reset();
    }
  }

  /**
   * Halves every counter and sets new size
   */
  private reset() {
    for (let i = 0; i < this.table.length; i++) {
      this.table[i] = this.table[i].map((c) => c / 2);
    }
    this.size /= 2;
  }

  private nextPowerOfTwo(value: number) {
    return 1 << (32 - Math.clz32(value - 1));
  }

  private hash(item: T) {
    const str = item.toString();
    let h = 0n;
    for (let i = 0; i < str.length; i++) {
      h = (31n * h + BigInt(str.charCodeAt(i))) | 0n;
    }
    return h;
  }

  private getCount(hash: bigint, depthIndex: number) {
    const tableIndex = this.tableIndex(hash, depthIndex);
    const index = this.counterIndex(hash, depthIndex);
    return this.table[tableIndex][index];
  }

  /**
   * Since for every item 4 counters are stored, this function returns the index
   * of the counter associated with the given hash and depth index.
   */
  private tableIndex(hash: bigint, depthIndex: number) {
    // fixed depth of 4
    const seeds = [
      0xc3a5c85c97cb3127n,
      0x9ae16a3b2f90404fn,
      0xb492b66fbe98f273n,
      0xfa2ff09a397c92e5n,
    ];
    let h = seeds[depthIndex] * hash;
    h += h >> 32n;
    return Number(h & BigInt(this.table.length - 1));
  }

  /**
   * Returns offset of the `counterIndex`th 4-bit counter given by its hashin.
   * An entry a number array (length 16), so the index is in [0, 15].
   * Counter index must be [0, 3].
   */
  private counterIndex(hash: bigint, depthIndex: number) {
    // we look at the 2 lsb of the hash. offset mult is in [0, 4, 8, 12]
    const offsetMultiplier = Number(hash & 3n) * 4;
    return offsetMultiplier + depthIndex;
  }

  /**
   * Increments counter if it is not already at maximum (15).
   * Returns true if the counter was incremented, false otherwise.
   */
  private tryIncrementCounterAt(hash: bigint, depthIndex: number) {
    const index = this.tableIndex(hash, depthIndex);
    const counterIndex = this.counterIndex(hash, depthIndex);

    // maximum of 15 reached
    if (this.table[index][counterIndex] >= 15) {
      return false;
    }

    // increment counter
    this.table[index][counterIndex] += 1;
    return true;
  }
}
