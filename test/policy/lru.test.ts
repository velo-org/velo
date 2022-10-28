import { Lru } from "../../src/policy/lru.ts";
import { assertEquals, assert } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("LRU create cache, should create a new empty cache", () => {
  const lru = new Lru(5);
  assertEquals(lru.size, 0);
});

Deno.test("LRU, should return correct capacity", () => {
  const lru = new Lru(5);
  assertEquals(lru.capacity, 5);
});

Deno.test("LRU get existing entry, should return the value", () => {
  const lru = new Lru(5);
  lru.set("key", true);
  assert(lru.get("key"));
});

Deno.test("LRU get (non-existent) entry from empty cache, should return undefined", () => {
  const lru = new Lru(5);
  assertEquals(lru.get("key"), undefined);
});

Deno.test("LRU get non-existent entry, should return undefined", () => {
  const lru = new Lru(5);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  assertEquals(lru.get("key"), undefined);
});

Deno.test("LRU get removed entry, should return undefined", () => {
  const lru = new Lru(5);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  lru.remove("3");
  assertEquals(lru.get("3"), undefined);
});

Deno.test("LRU peek existing, should return value", () => {
  const lru = new Lru(5);
  lru.set("1", 1);
  assertEquals(lru.peek("1"), 1);
});

Deno.test("LRU peek non-existing, should return undefined", () => {
  const lru = new Lru(5);
  assertEquals(lru.peek("1"), undefined);
});

Deno.test("LRU set after capacity reached, should evict to maintain capacity", () => {
  const lru = new Lru(5);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  lru.set("5", 5);
  lru.set("6", 6);
  assertEquals(lru.size, 5);
});

Deno.test("LRU set after capacity reached, should evict first inserted key", () => {
  const lru = new Lru(5);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  lru.set("5", 5);
  lru.set("6", 6);
  assert(!lru.has("1"));
});

Deno.test("LRU full scan, should evict all keys", () => {
  const lru = new Lru(3);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  lru.set("5", 5);
  lru.set("6", 6);

  assertEquals(lru.keys, ["4", "5", "6"]);
});

Deno.test("LRU forEach should print out the right key value pairs", () => {
  const lru = new Lru<string, number>(5);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  lru.set("5", 5);
  lru.remove("5");
  const testKeys: string[] = [];
  lru.forEach((i) => {
    testKeys.push(i.key);
  });
  assertEquals(testKeys.length, 4);
  assertEquals(testKeys, ["4", "3", "2", "1"]);
});

Deno.test("LRU use with ttl", async () => {
  const lru = Velo.builder().capacity(5).lru().ttl(100).build();
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  lru.set("5", 5);
  await sleep(1070);
  lru.get("");
  assertEquals(lru.size, 0);
  assertEquals(lru.keys, []);
});

Deno.test("LRU should collect cache stats", () => {
  const lru = Velo.builder().capacity(3).lru().stats().build();
  assertEquals(lru.stats.hitCount, 0);
  assertEquals(lru.stats.missCount, 0);

  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4); // evict
  lru.get("1"); // miss
  lru.get("2"); // hit
  lru.get("3"); // hit
  lru.get("4"); // hit

  assertEquals(lru.stats.hitCount, 3);
  assertEquals(lru.stats.missCount, 1);
});

Deno.test("LRU should call onEvict listener", () => {
  const lru = Velo.builder()
    .capacity(3)
    .lru()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4); // evicts "1"
});

Deno.test("LRU, should expose keys and values", () => {
  const lru = new Lru(5);
  lru.set("1", 1);
  lru.set("2", 2);
  lru.set("3", 3);
  lru.set("4", 4);
  assertEquals(lru.keys, ["1", "2", "3", "4"]);
  assertEquals(lru.values, [1, 2, 3, 4]);
});
