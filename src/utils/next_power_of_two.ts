/**
 * Returns the smallest power of to that is equal to or greater than the given value.
 */
export function nextPowerOfTwo(value: number) {
  return 1 << (32 - Math.clz32(value - 1));
}
