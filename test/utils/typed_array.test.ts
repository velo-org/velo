import { getTypedArray } from "../../src/utils/typed_array.ts";
import { assert, assertEquals } from "../test_deps.ts";

Deno.test("getTypedArray, should return Uint8Array", () => {
  const arr = getTypedArray(10);
  assertEquals(arr.length, 10);
  assert(arr instanceof Uint8Array);
});

Deno.test("getTypedArray, should return Uint16Array", () => {
  const arr = getTypedArray(1000);
  assertEquals(arr.length, 1000);
  assert(arr instanceof Uint16Array);
});

Deno.test("getTypedArray, should return Uint32Array", () => {
  const arr = getTypedArray(1000000);
  assertEquals(arr.length, 1000000);
  assert(arr instanceof Uint32Array);
});

Deno.test("getTypedArray, should return Float64Array", () => {
  const arr = getTypedArray(1000000000);
  assertEquals(arr.length, 1000000000);
});
