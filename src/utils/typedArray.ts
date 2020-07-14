const MAX_8BIT_INTEGER = Math.pow(2, 8) - 1,
  MAX_16BIT_INTEGER = Math.pow(2, 16) - 1,
  MAX_32BIT_INTEGER = Math.pow(2, 32) - 1;

export type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float64Array;

export function getTypedArray(capacity: number): TypedArray {
  const maxIndex = capacity - 1;

  if (maxIndex <= MAX_8BIT_INTEGER) return new Uint8Array(capacity);

  if (maxIndex <= MAX_16BIT_INTEGER) return new Uint16Array(capacity);

  if (maxIndex <= MAX_32BIT_INTEGER) return new Uint32Array(capacity);

  return new Float64Array(capacity);
}
