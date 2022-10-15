import { Key } from "../../models/cache.ts";

/**
 * A probabilistic set for estimating the frequency of elements within a time
 * window to use as _freshness_ metric for the TinyLFU [1] admission policy.
 * Inspired by Caffeine's implementation: https://github.com/ben-manes/caffeine.
 *
 * The maximum frequency is 15(4 bits). Employs a 4-bit Count-Min Sketch[2].
 * The counter matrix is implemented as a single dimensional array, holding 16
 * counters (4 * 16 = 64 bit) per index. Length of the array is at least the
 * capacity of the cache for accuracy, but is increased to the next power of two.
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
  private table: BigUint64Array = new BigUint64Array(8);
  private size = 0;
  private samplingSize = 0;
  private readonly thresholdFactor = 10;

  constructor(capacity: number) {
    this.changeCapacity(capacity);
  }

  changeCapacity(capacity: number) {
    const maximum = Math.min(capacity, Number.MAX_SAFE_INTEGER >>> 2);
    this.table = new BigUint64Array(Math.max(this.nextPowerOfTwo(maximum), 8));
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
      frequency = Math.min(frequency, Number(this.getCount(hash, i)));
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
      // halving the counters via right shift
      // the bitwise AND on a 4-bit counter with 0111 (=7) will clear the bit
      // that was shifted over from the other counter by the right shift.
      this.table[i] = (this.table[i] >> 1n) & 0x7777777777777777n;
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

  private getCount(hash: bigint, counterIndex: number) {
    const tableIndex = this.tableIndex(hash, counterIndex);
    const offset = this.counterOffset(hash, counterIndex);
    return (BigInt(this.table[tableIndex]) >> offset) & 0xfn;
  }

  /**
   * Returns the index of the 64-bit block in the table, where the counter with
   * given index and hashing function is stored.
   */
  private tableIndex(hash: bigint, counterIndex: number) {
    const seeds = [
      0x7137449112835b01n,
      0xab1c5ed5c19bf174n,
      0xa4506ceb4ed8aa4an,
      0x27b70a854d2c6dfcn,
    ];
    let h = seeds[counterIndex] * hash;
    h += h >> 32n;
    return Number(h & (BigInt(this.table.length) - 1n));
  }

  /**
   * Returns offset of the `counterIndex`th 4-bit counter given by its hashing
   * function. An entry is 64 bits, so the offset is in the interval [0, 60] and
   * a multiple of 4.
   */
  private counterOffset(hash: bigint, counterIndex: number) {
    const offsetMultiplier = (hash & 3n) << 2n;
    return (offsetMultiplier + BigInt(counterIndex)) << 2n;
  }

  /**
   * Increments counter at given index by 1 if it is not already at maximum (15).
   * Returns true if the counter was incremented, false otherwise.
   */
  private tryIncrementCounterAt(hash: bigint, counterIndex: number) {
    const index = this.tableIndex(hash, counterIndex);
    const offset = this.counterOffset(hash, counterIndex);
    const mask = 0xfn << offset; // 4-bit mask at offset

    // maximum of 15 reached
    if (!((this.table[index] & mask) != mask)) {
      return false;
    }

    // increment counter
    this.table[index] += 1n << offset;
    return true;
  }
}
