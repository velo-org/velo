import { assert, assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("LRU create cache, should create a new empty cache", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  assertEquals(lruCache.size, 0);
});

Deno.test("LRU get existing entry, should return the value", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  lruCache.set("key", true);
  assert(lruCache.get("key"));
});

Deno.test(
  "LRU get (non-existent) entry from empty cache, should return undefined",
  () => {
    const lruCache = Velo.builder().capacity(5).lru().build();
    assertEquals(lruCache.get("key"), undefined);
  }
);

Deno.test("LRU get non-existent entry, should return undefined", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  assertEquals(lruCache.get("key"), undefined);
});

Deno.test("LRU get removed entry, should return undefined", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.remove("3");
  assertEquals(lruCache.get("3"), undefined);
});

Deno.test(
  "LRU set after capacity reached, should evict to maintain capacity",
  () => {
    const lruCache = Velo.builder().capacity(5).lru().build();
    lruCache.set("1", 1);
    lruCache.set("2", 2);
    lruCache.set("3", 3);
    lruCache.set("4", 4);
    lruCache.set("5", 5);
    lruCache.set("6", 6);
    assertEquals(lruCache.size, 5);
  }
);

Deno.test(
  "LRU set after capacity reached, should evict first inserted key",
  () => {
    const lruCache = Velo.builder().capacity(5).lru().build();
    lruCache.set("1", 1);
    lruCache.set("2", 2);
    lruCache.set("3", 3);
    lruCache.set("4", 4);
    lruCache.set("5", 5);
    lruCache.set("6", 6);
    assert(!lruCache.has("1"));
  }
);

Deno.test("LRU full scan, should evict all keys", () => {
  const lruCache = Velo.builder().capacity(3).lru().build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.set("5", 5);
  lruCache.set("6", 6);

  assertEquals(lruCache.keys, ["4", "5", "6"]);
});

Deno.test("LRU forEach should print out the right key value pairs", () => {
  const lruCache = Velo.builder<string, number>().capacity(5).lru().build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.set("5", 5);
  lruCache.remove("5");
  const testKeys: string[] = [];
  lruCache.forEach((i) => {
    testKeys.push(i.key);
  });
  assertEquals(testKeys.length, 4);
  assertEquals(testKeys, ["4", "3", "2", "1"]);
});

Deno.test("LRU use with ttl", async () => {
  const lruCache = Velo.builder().capacity(5).lru().ttl(200).build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.set("5", 5);
  await sleep(1000);
  assertEquals(lruCache.size, 0);
  assertEquals(lruCache.keys, []);
});

Deno.test("LRU should collect cache stats", () => {
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
