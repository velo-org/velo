// deno-lint-ignore-file no-explicit-any
import { assert, assertEquals, assertFalse } from "../../dev_deps.ts";
import { Key } from "../../src/cache/key.ts";
import { FrequencySketch } from "../../src/policy/tiny_lfu/frequency_sketch.ts";

function countersFromTable<T extends Key>(sketch: FrequencySketch<T>): Array<number> {
  return (sketch as any).table;
}

const TEST_HASH_1 = 0x12345678;
const TEST_HASH_2 = 0x87654321;

Deno.test("FrequencySketch, should initially be empty", () => {
  const frequencySketch = new FrequencySketch(8);
  const counterSum = countersFromTable(frequencySketch).reduce((a, b) => a + b, 0);
  assertEquals(counterSum, 0);
  assertEquals((frequencySketch as any).size, 0);
});

Deno.test("FrequencySketch, should expand to next power of two", () => {
  const depth = 4;
  const frequencySketch = new FrequencySketch(120, depth);
  assertEquals((frequencySketch as any).table.length / depth, 128);
});

Deno.test("FrequencySketch, unrecorded key should have 0 frequency", () => {
  const frequencySketch = new FrequencySketch(8);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 0);
  assertFalse(frequencySketch.contains(TEST_HASH_1));
});

Deno.test("FrequencySketch, recorded key should have non-zero frequency", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment(TEST_HASH_1);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 1);
  assert(frequencySketch.contains(TEST_HASH_1));
});

Deno.test("FrequencySketch, should have depth of 4", () => {
  const depth = 4;
  const frequencySketch = new FrequencySketch(8, depth);
  frequencySketch.increment(TEST_HASH_1);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 1);
  const incrementedRows = countersFromTable(frequencySketch).reduce((a, b) => a + b, 0);
  assertEquals(incrementedRows, 4);
});

Deno.test("FrequencySketch, should increment", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment(TEST_HASH_1);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 1);
  frequencySketch.increment(TEST_HASH_1);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 2);
  frequencySketch.increment(TEST_HASH_1);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 3);
});

Deno.test("FrequencySketch, should not increment other keys", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment(TEST_HASH_1);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 1);
  frequencySketch.increment(TEST_HASH_2);
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 1);
  assertEquals(frequencySketch.frequency(TEST_HASH_2), 1);
});

Deno.test("FrequencySketch, should increment to a max of 15", () => {
  const frequencySketch = new FrequencySketch(8);
  for (let i = 0; i < 100; i++) {
    frequencySketch.increment(TEST_HASH_1);
  }
  assertEquals(frequencySketch.frequency(TEST_HASH_1), 15);
});

Deno.test("FrequencySketch, should downsample, halving the counters and size (assumes maxSize 15)", () => {
  const width = 8;
  const depth = 4;
  const frequencySketch = new FrequencySketch(width, depth);
  const resetSize: number = (frequencySketch as any).resetSize;
  const resetFactor = 10;

  // before reset
  for (let hash = 0; hash < width - 1; hash++) {
    for (let i = 0; i < resetFactor; i++) {
      frequencySketch.increment(hash);
    }
    assertEquals(frequencySketch.frequency(hash), resetFactor);
  }

  // last loop iteration will trigger reset
  for (let i = 0; i < resetFactor; i++) {
    frequencySketch.increment(width - 1);
  }

  // after reset
  for (let hash = 0; hash < width; hash++) {
    assertEquals(frequencySketch.frequency(hash), resetFactor / 2);
  }
  assertEquals((frequencySketch as any).size, resetSize / 2);
});
