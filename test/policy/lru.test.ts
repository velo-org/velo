import { assertEquals, assert } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
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

Deno.test("LRU get (non-existent) entry from empty cache, should return undefined", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  assertEquals(lruCache.get("key"), undefined);
});

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

Deno.test("LRU set after capacity reached, should evict to maintain capacity", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.set("5", 5);
  lruCache.set("6", 6);
  assertEquals(lruCache.size, 5);
});

Deno.test("LRU set after capacity reached, should evict first inserted key", () => {
  const lruCache = Velo.builder().capacity(5).lru().build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.set("5", 5);
  lruCache.set("6", 6);
  assert(!lruCache.has("1"));
});

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
  const lruCache = Velo.builder().capacity(5).lru().ttl(100).build();
  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4);
  lruCache.set("5", 5);
  await sleep(1070);
  lruCache.get("");
  assertEquals(lruCache.size, 0);
  assertEquals(lruCache.keys, []);
});

Deno.test("LRU should collect cache stats", () => {
  const lruCache = Velo.builder().capacity(3).arc().stats().build();
  assertEquals(lruCache.stats.hitCount, 0);
  assertEquals(lruCache.stats.missCount, 0);

  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4); // evict
  lruCache.get("1"); // miss
  lruCache.get("2"); // hit
  lruCache.get("3"); // hit
  lruCache.get("4"); // hit

  assertEquals(lruCache.stats.hitCount, 3);
  assertEquals(lruCache.stats.missCount, 1);
});

Deno.test("LRU should call onEvict listener", () => {
  const lruCache = Velo.builder()
    .capacity(3)
    .lru()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  lruCache.set("1", 1);
  lruCache.set("2", 2);
  lruCache.set("3", 3);
  lruCache.set("4", 4); // evicts "1"
});
