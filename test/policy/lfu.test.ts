import { assertEquals, assert, assertFalse } from "../test_deps.ts";
import { Lfu } from "../../src/policy/lfu.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("LFU create cache, should create a new empty cache", () => {
  const lfu = new Lfu(5);
  assertEquals(lfu.size, 0);
});

Deno.test("LFU, should return correct capacity", () => {
  const lfu = new Lfu(5);
  assertEquals(lfu.capacity, 5);
});

Deno.test("LFU clear, should reset the cache", () => {
  const lfu = new Lfu(5);
  lfu.set("key", 1);
  lfu.set("key", 2);
  lfu.clear();
  assertEquals(lfu.size, 0);
});

Deno.test("LFU has, should return true if exists, false otherwise", () => {
  const lfu = new Lfu(5);
  lfu.set("key", 1);
  assert(lfu.has("key"));
  assertFalse(lfu.has("key2"));
});

Deno.test("LFU get existing entry, should return the value", () => {
  const lfu = new Lfu(5);
  lfu.set("key", true);
  assert(lfu.get("key"));
});

Deno.test("LFU get (non-existent) entry from empty cache, should return undefined", () => {
  const lfu = new Lfu(5);
  assertEquals(lfu.get("key"), undefined);
});

Deno.test("LFU get non-existent entry, should return undefined", () => {
  const lfu = new Lfu(5);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  assertEquals(lfu.get("key"), undefined);
});

Deno.test("LFU get removed entry, should return undefined", () => {
  const lfu = new Lfu(5);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  lfu.remove("3");
  assertEquals(lfu.get("3"), undefined);
});

Deno.test("LFU peek existing, should return value", () => {
  const lfu = new Lfu(5);
  lfu.set("key", 1);
  assertEquals(lfu.peek("key"), 1);
});

Deno.test("LFU peek non-existing, should return undefined", () => {
  const lfu = new Lfu(5);
  assertEquals(lfu.peek("key"), undefined);
});

Deno.test("LFU set existing, should overwrite", () => {
  const lfu = new Lfu(5);
  lfu.set("key", 1);
  lfu.set("key", 2);
  assertEquals(lfu.get("key"), 2);
});

Deno.test("LFU set one more than allowed capacity, should not increase amount of keys", () => {
  const lfu = new Lfu(5);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  lfu.set("5", 5);
  lfu.set("6", 6);
  assertEquals(lfu.size, 5);
});

Deno.test("LFU set one more than allowed capacity, should evict first inserted key", () => {
  const lfu = new Lfu(5);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  lfu.set("5", 5);
  lfu.set("6", 6);
  assert(!lfu.has("1"));
});

Deno.test("LFU set double the allowed capacity, should evict all keys", () => {
  const lfu = new Lfu(3);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  lfu.set("5", 5);
  lfu.set("6", 6);

  assertEquals(lfu.keys, ["4", "5", "6"]);
});

Deno.test("LFU use with ttl", async () => {
  const lfu = Velo.builder().ttl(100).capacity(5).lfu().build();
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  lfu.set("5", 5);
  await sleep(1070);
  lfu.get("");
  assertEquals(lfu.size, 0);
  assertEquals(lfu.keys, []);
});

Deno.test("LFU forEach should print out the right key value pairs", () => {
  const lfu = new Lfu<string, number>(5);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4);
  lfu.set("5", 5);
  lfu.remove("5");
  const testKeys: string[] = [];
  lfu.forEach((i) => {
    testKeys.push(i.key);
  });
  assertEquals(testKeys, ["1", "2", "3", "4"]);
});

Deno.test("LFU get first entry, entry should not be deleted", () => {
  const lfu = new Lfu(3);
  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.get("1");
  lfu.set("4", 4);
  lfu.set("5", 5);
  lfu.set("6", 6);

  assertEquals(lfu.keys, ["1", "5", "6"]);
});

Deno.test("LFU should collect cache stats", () => {
  const lfu = Velo.builder().capacity(3).lfu().stats().build();
  assertEquals(lfu.stats.hitCount, 0);
  assertEquals(lfu.stats.missCount, 0);

  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4); // evict
  lfu.get("1"); // miss
  lfu.get("2"); // hit
  lfu.get("3"); // hit
  lfu.get("4"); // hit

  assertEquals(lfu.stats.hitCount, 3);
  assertEquals(lfu.stats.missCount, 1);
});

Deno.test("LFU should call onEvict listener", () => {
  const lfu = Velo.builder()
    .capacity(3)
    .lfu()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  lfu.set("1", 1);
  lfu.set("2", 2);
  lfu.set("3", 3);
  lfu.set("4", 4); // evicts "1"
});
