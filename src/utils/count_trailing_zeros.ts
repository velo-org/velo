export function countTrailingZeros(v: number) {
  let c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000ffff) c -= 16;
  if (v & 0x00ff00ff) c -= 8;
  if (v & 0x0f0f0f0f) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
