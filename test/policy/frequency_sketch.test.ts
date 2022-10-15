// deno-lint-ignore-file no-explicit-any
import { assert, assertEquals, assertFalse } from "../../dev_deps.ts";
import { Key } from "../../src/models/cache.ts";
import { FrequencySketch } from "../../src/policy/tiny_lfu/frequency_sketch.ts";

// helper function to extract counter data
function binaryStringsFromTable<T extends Key>(
  sketch: FrequencySketch<T>
): Array<string> {
  const table: BigUint64Array = (sketch as any).table;
  return Array.from(table).map((n) => n.toString(2).padStart(64, "0"));
}

// helper function to extract counter data
function countersFromTable<T extends Key>(
  sketch: FrequencySketch<T>
): Array<Array<number>> {
  return binaryStringsFromTable(sketch).map((s) =>
    s.match(/.{1,4}/g)!.map((b) => parseInt(b, 2))
  );
}

Deno.test("FrequencySketch, should initially be empty", () => {
  const frequencySketch = new FrequencySketch(8);
  const counterSum = countersFromTable(frequencySketch)
    .flat()
    .reduce((a, b) => a + b, 0);
  assertEquals(counterSum, 0);
  assertEquals((frequencySketch as any).size, 0);
});

Deno.test("FrequencySketch, should expand to next power of two", () => {
  const frequencySketch = new FrequencySketch(120);
  assertEquals((frequencySketch as any).table.length, 128);
});

Deno.test(
  "FrequencySketch, should have correct internal representation",
  () => {
    const frequencySketch = new FrequencySketch(8);
    assertEquals(
      binaryStringsFromTable(frequencySketch),
      Array(8).fill("0".repeat(64))
    );
  }
);

Deno.test("FrequencySketch, unrecorded key should have 0 frequency", () => {
  const frequencySketch = new FrequencySketch(8);
  assertEquals(frequencySketch.frequency("1"), 0);
  assertFalse(frequencySketch.contains("1"));
});

Deno.test(
  "FrequencySketch, recorded key should have non-zero frequency",
  () => {
    const frequencySketch = new FrequencySketch(8);
    frequencySketch.increment("1");
    assertEquals(frequencySketch.frequency("1"), 1);
    assert(frequencySketch.contains("1"));
  }
);

Deno.test("FrequencySketch, should increment", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 1);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 2);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 3);
});

Deno.test("FrequencySketch, should increment to a max of 15", () => {
  const frequencySketch = new FrequencySketch(8);
  for (let i = 0; i < 100; i++) {
    frequencySketch.increment("1");
  }
  assertEquals(frequencySketch.frequency("1"), 15);
});

Deno.test(
  "FrequencySketch, should downsample, halving the counters and size",
  () => {
    const frequencySketch = new FrequencySketch(8);
    const thresholdFactor: number = (frequencySketch as any).thresholdFactor;
    const samplingSize: number = (frequencySketch as any).samplingSize;
    const len: number = (frequencySketch as any).table.length;

    // before reset
    for (let key = 0; key < len - 1; key++) {
      for (let i = 0; i < thresholdFactor; i++) {
        frequencySketch.increment(key.toString());
      }
      assertEquals(frequencySketch.frequency(key.toString()), thresholdFactor);
    }

    // last loop iteration will trigger reset
    for (let i = 0; i < thresholdFactor; i++) {
      frequencySketch.increment((len - 1).toString());
    }

    // after reset
    for (let key = 0; key < len; key++) {
      assertEquals(
        frequencySketch.frequency(key.toString()),
        thresholdFactor / 2
      );
    }
    assertEquals((frequencySketch as any).size, samplingSize / 2);
  }
);
