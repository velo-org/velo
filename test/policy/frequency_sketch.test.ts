// deno-lint-ignore-file no-explicit-any
import { assert, assertEquals, assertFalse } from "../../dev_deps.ts";
import { Key } from "../../src/models/cache.ts";
import { FrequencySketch } from "../../src/policy/tiny_lfu/frequency_sketch.ts";

function countersFromTable<T extends Key>(
  sketch: FrequencySketch<T>
): Array<Array<number>> {
  return (sketch as any).table;
}

function stringsFromTable<T extends Key>(sketch: FrequencySketch<T>) {
  const a = countersFromTable(sketch);
  return a.map((row: Array<number>) =>
    row.map((c: number) => c.toString(10).padStart(2, " ")).join(" ")
  );
}

Deno.test("FrequencySketch, should initially be empty", () => {
  const frequencySketch = new FrequencySketch(8);
  const counterSum = countersFromTable(frequencySketch)
    .flat()
    .reduce((a, b) => a + b, 0);
  assertEquals(counterSum, 0);
  assertEquals((frequencySketch as any).size, 0);
  stringsFromTable(frequencySketch).forEach((row) => {
    assertEquals(row, " 0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0");
  });
});

Deno.test("FrequencySketch, should expand to next power of two", () => {
  const frequencySketch = new FrequencySketch(120);
  assertEquals((frequencySketch as any).table.length, 128);
});

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

Deno.test("FrequencySketch, should have depth of 4", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 1);
  const incrementedRows = countersFromTable(frequencySketch).filter((r) =>
    r.includes(1)
  ).length;
  console.log(stringsFromTable(frequencySketch));

  assertEquals(incrementedRows, 4);
});

Deno.test("FrequencySketch, should increment", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 1);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 2);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 3);
});

Deno.test("FrequencySketch, should not increment other keys", () => {
  const frequencySketch = new FrequencySketch(8);
  frequencySketch.increment("1");
  assertEquals(frequencySketch.frequency("1"), 1);
  frequencySketch.increment("2");
  assertEquals(frequencySketch.frequency("1"), 1);
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
    const tableLength = 8;
    const thresholdFactor: number = (frequencySketch as any).thresholdFactor;
    const sampling: number = tableLength * thresholdFactor;

    // before reset
    for (let key = 0; key < tableLength - 1; key++) {
      for (let i = 0; i < thresholdFactor; i++) {
        frequencySketch.increment(key.toString());
      }
      assertEquals(frequencySketch.frequency(key.toString()), thresholdFactor);
    }

    // last loop iteration will trigger reset
    for (let i = 0; i < thresholdFactor; i++) {
      frequencySketch.increment((tableLength - 1).toString());
    }

    // after reset
    for (let key = 0; key < tableLength; key++) {
      assertEquals(
        frequencySketch.frequency(key.toString()),
        thresholdFactor / 2
      );
    }
    assertEquals((frequencySketch as any).size, sampling / 2);
  }
);
