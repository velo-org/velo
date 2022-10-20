import { Key } from "../../cache/key.ts";

export function hash(data: string): number;
export function hash(data: number): number;
export function hash(data: Key): number;
export function hash(data: Key): number {
  const str = data.toString();
  let h = 0;
  for (let ii = 0; ii < str.length; ii++) {
    h = (31 * h + str.charCodeAt(ii)) | 0;
  }

  return to31BitSigned(h);
}

function to31BitSigned(i32: number) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}
