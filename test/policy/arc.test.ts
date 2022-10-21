import { assert, assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { getPolicy } from "../utils/get_policy.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("ARC create cache, should create a new empty cache", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  assertEquals(arcCache.size, 0);
});

Deno.test("ARC get existing entry, should return the value", () => {
  const arcCache = Velo.builder<string, boolean>().capacity(5).arc().build();
  arcCache.set("key", true);
  assert(arcCache.get("key"));
});

Deno.test("ARC get (non-existent) entry from empty cache, should return undefined", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  assertEquals(arcCache.get("key"), undefined);
});

Deno.test("ARC get non-existent entry, should return undefined", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  assertEquals(arcCache.get("key"), undefined);
});

Deno.test("ARC get removed entry, should return undefined", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.remove("3");
  assertEquals(arcCache.get("3"), undefined);
});

Deno.test("ARC set after capacity reached, should evict to maintain capacity", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  arcCache.set("6", 6);
  assertEquals(arcCache.size, 5);
});

Deno.test("ARC set after capacity reached, should evict first inserted key", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  arcCache.set("6", 6);
  assert(!arcCache.has("1"));
});

Deno.test("ARC immediate full scan, should evict all keys", () => {
  const arcCache = Velo.builder().capacity(3).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  arcCache.set("6", 6);

  assertEquals(arcCache.keys, ["4", "5", "6"]);
});

Deno.test("ARC forEach should print out the right key value pairs", () => {
  const arcCache = Velo.builder<string, number>().capacity(5).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  arcCache.remove("3");
  const testKeys: string[] = [];
  arcCache.forEach((e, _) => {
    testKeys.push(e.key);
  });
  assertEquals(testKeys, ["5", "4", "2", "1"]);
});

Deno.test("ARC use with ttl", async () => {
  const arcCache = Velo.builder().capacity(5).ttl(500).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  await sleep(1000);
  assertEquals(arcCache.size, 0);
  assertEquals(arcCache.keys, []);
});

Deno.test("ARC getting entry from t1, should move it to t2", () => {
  const arcCache = Velo.builder().capacity(5).arc().build();
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.get("3");
  assertEquals(getPolicy(arcCache).t2.keys, ["3"]); // frequently set
});

Deno.test(
  "ARC setting entry that was evicted from t1, should remove it from b1 into t2 and also evict the last entry from t1 into b1",
  () => {
    const arcCache = Velo.builder().capacity(5).arc().build();
    arcCache.set("1", 1);
    arcCache.set("2", 2);
    arcCache.set("3", 3);
    arcCache.set("4", 4);
    arcCache.set("5", 5);
    arcCache.set("6", 6);
    assertEquals(getPolicy(arcCache).b1.keys, ["1"]); // recently evicted
    arcCache.set("1", 1);
    assertEquals(getPolicy(arcCache).b1.keys, ["2"]); // recently evicted
    assertEquals(getPolicy(arcCache).t1.keys, ["6", "3", "4", "5"]); // recently set
    assertEquals(getPolicy(arcCache).t2.keys, ["1"]); // frequently set
  }
);

Deno.test("ARC should collect cache stats", () => {
  const arcCache = Velo.builder().capacity(3).arc().stats().build();
  assertEquals(arcCache.stats.hitCount, 0);
  assertEquals(arcCache.stats.missCount, 0);

  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4); // evict
  arcCache.get("1"); // miss
  arcCache.get("2"); // hit
  arcCache.get("3"); // hit
  arcCache.get("4"); // hit

  assertEquals(arcCache.stats.hitCount, 3);
  assertEquals(arcCache.stats.missCount, 1);
});
