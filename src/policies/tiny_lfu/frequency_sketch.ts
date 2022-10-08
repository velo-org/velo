/**
 * A probabilistic set for estimating the frequency of elements within a time
 * window to use as _freshness_ metric for the TinyLFU [1] admission policy.
 * Inspired by Caffeine's implementation: https://github.com/ben-manes/caffeine.
 *
 * The maximum frequency is 15(4 bits). Employs a 4-bit Count-Min Sketch[2].
 * The counter matrix is implemented as a single dimensional array, holding 16
 * counters (4 * 16 = 64 bit) per index. Length of the array equals the capacity
 * of the cache for accuracy, but is increased to the next power of two.
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
export class FrequencySketch<T> {
  private table: Float64Array = new Float64Array(8);
  private size = 0;
  private samplingSize = 0;

  constructor(capacity: number) {
    this.changeCapacity(capacity);
  }

  changeCapacity(capacity: number) {
    const maximum = Math.min(capacity, Number.MAX_SAFE_INTEGER >>> 2);
    this.table = new Float64Array(Math.max(this.nextPowerOfTwo(maximum), 8));
    this.size = 0;
    this.samplingSize = this.table.length * 10;
  }

  contains(item: T) {
    return this.frequency(item) > 0;
  }

  /**
   * Returns the estimated frequency of the given item. Up to a maximum of 15.
   */
  frequency(item: T) {
    const hash = this.hash(item);
    let frequency = 0;

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

    if (wasIncremented && ++this.size === this.samplingSize) {
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
      this.table[i] = (this.table[i] >> 1) & 0x7777777777777777;
    }
    this.size /= 2;
  }

  private nextPowerOfTwo(value: number) {
    return 1 << (32 - Math.clz32(value - 1));
  }

  private hash(_item: T) {
    return 0;
  }

  private getCount(hash: number, counterIndex: number) {
    const tableIndex = this.tableIndex(hash, counterIndex);
    const offset = this.counterOffset(hash, counterIndex);
    return (this.table[tableIndex] >>> offset) & 0xf;
  }

  /**
   * Returns the index of the 64-bit block in the table, where the counter with
   * given index and hashing function is stored.
   */
  private tableIndex(hash: number, counterIndex: number) {
    const seeds = [
      0x7137449112835b01, 0xab1c5ed5c19bf174, 0xa4506ceb4ed8aa4a,
      0x27b70a854d2c6dfc,
    ];
    let h = seeds[counterIndex] * hash;
    h += h >> 32;
    return h & (this.table.length - 1);
  }

  /**
   * Returns offset of the `counterIndex`th 4-bit counter given by its hashing
   * function. An entry is 64 bits, so the offset is in the interval [0, 60] and
   * a multiple of 4.
   */
  private counterOffset(hash: number, counterIndex: number) {
    const offsetMultiplier = (hash & 3) << 2;
    return (offsetMultiplier + counterIndex) << 2;
  }

  private tryIncrementCounterAt(hash: number, counterIndex: number) {
    const index = this.tableIndex(hash, counterIndex);
    const offset = this.counterOffset(hash, counterIndex);
    const mask = 0xf << offset;

    // maximum of 15 reached
    if (!((this.table[index] & mask) != mask)) {
      return false;
    }

    // increment counter
    this.table[index] += 1 << offset;
    return true;
  }
}
