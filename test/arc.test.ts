import { ARC } from "../src/caches/arc.ts";
import { assert, assertEquals } from "../dev_deps.ts";
import { sleep } from "../src/utils/sleep.ts";
import { Key } from "../src/models/key.ts";

Deno.test("ARC create cache, should create a new empty cache", () => {
  const arcCache = new ARC({ capacity: 5 });
  assertEquals(arcCache.size, 0);
});

Deno.test("ARC get existing entry, should return the value", () => {
  const arcCache = new ARC({ capacity: 5 });
  arcCache.set("key", true);
  assert(arcCache.get("key"));
});

Deno.test(
  "ARC get (non-existent) entry from empty cache, should return undefined",
  () => {
    const arcCache = new ARC({ capacity: 5 });
    assertEquals(arcCache.get("key"), undefined);
  },
);

Deno.test("ARC get non-existent entry, should return undefined", () => {
  const arcCache = new ARC({ capacity: 5 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  assertEquals(arcCache.get("key"), undefined);
});

Deno.test("ARC get removed entry, should return undefined", () => {
  const arcCache = new ARC({ capacity: 5 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.remove("3");
  assertEquals(arcCache.get("3"), undefined);
});

Deno.test(
  "ARC set one more than allowed capacity, should not increase amount of keys",
  () => {
    const arcCache = new ARC({ capacity: 5 });
    arcCache.set("1", 1);
    arcCache.set("2", 2);
    arcCache.set("3", 3);
    arcCache.set("4", 4);
    arcCache.set("5", 5);
    arcCache.set("6", 6);
    assertEquals(arcCache.size, 5);
  },
);

Deno.test(
  "ARC set one more than allowed capacity, should evict first inserted key",
  () => {
    const arcCache = new ARC({ capacity: 5 });
    arcCache.set("1", 1);
    arcCache.set("2", 2);
    arcCache.set("3", 3);
    arcCache.set("4", 4);
    arcCache.set("5", 5);
    arcCache.set("6", 6);
    assert(!arcCache.has("1"));
  },
);

Deno.test("ARC set double the allowed capacity, should evict all keys", () => {
  const arcCache = new ARC({ capacity: 3 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  arcCache.set("6", 6);

  assertEquals(arcCache.keys, ["4", "5", "6"]);
});

Deno.test("ARC forEach should print out the right key value pairs", () => {
  const arcCache = new ARC({ capacity: 5 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  arcCache.remove("3");
  const testKeys: Key[] = [];
  arcCache.forEach((e, index) => {
    testKeys.push(e.key);
  });
  assertEquals(testKeys, ["5", "4", "2", "1"]);
});

Deno.test("ARC use with ttl", async () => {
  const arcCache = new ARC({ capacity: 5, stdTTL: 500 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5);
  await sleep(1000);
  assertEquals(arcCache.size, 0);
  assertEquals(arcCache.keys, []);
});

Deno.test("ARC use with ttl, override ttl for specific set", async () => {
  const arcCache = new ARC({ capacity: 5, stdTTL: 500 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.set("4", 4);
  arcCache.set("5", 5, 1000);
  await sleep(600);
  assertEquals(arcCache.keys, ["5"]);
  await sleep(600);
});

Deno.test("ARC getting entry from t1, should move it to t2", async () => {
  const arcCache = new ARC({ capacity: 5 });
  arcCache.set("1", 1);
  arcCache.set("2", 2);
  arcCache.set("3", 3);
  arcCache.get("3");
  assertEquals(arcCache.frequentlySet.keys, ["3"]);
});

Deno.test(
  "ARC setting entry that was evicted from t1, should remove it from b1 into t2 and also evict the last entry from t1 into b1",
  async () => {
    const arcCache = new ARC({ capacity: 5 });
    arcCache.set("1", 1);
    arcCache.set("2", 2);
    arcCache.set("3", 3);
    arcCache.set("4", 4);
    arcCache.set("5", 5);
    arcCache.set("6", 6);
    assertEquals(arcCache.recentlyEvicted.keys, ["1"]);
    arcCache.set("1", 1);
    assertEquals(arcCache.recentlyEvicted.keys, ["2"]);
    assertEquals(arcCache.recentlySet.keys, ["6", "3", "4", "5"]);
    assertEquals(arcCache.frequentlySet.keys, ["1"]);
  },
);
