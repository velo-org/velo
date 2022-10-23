import { assertEquals, assert } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("LFU create cache, should create a new empty cache", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  assertEquals(lfuCache.size, 0);
});

Deno.test("LFU get existing entry, should return the value", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  lfuCache.set("key", true);
  assert(lfuCache.get("key"));
});

Deno.test("LFU get (non-existent) entry from empty cache, should return undefined", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  assertEquals(lfuCache.get("key"), undefined);
});

Deno.test("LFU get non-existent entry, should return undefined", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  assertEquals(lfuCache.get("key"), undefined);
});

Deno.test("LFU get removed entry, should return undefined", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.remove("3");
  assertEquals(lfuCache.get("3"), undefined);
});

Deno.test("LFU set one more than allowed capacity, should not increase amount of keys", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.set("6", 6);
  assertEquals(lfuCache.size, 5);
});

Deno.test("LFU set one more than allowed capacity, should evict first inserted key", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.set("6", 6);
  assert(!lfuCache.has("1"));
});

Deno.test("LFU set double the allowed capacity, should evict all keys", () => {
  const lfuCache = Velo.builder().capacity(3).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.set("6", 6);

  assertEquals(lfuCache.keys, ["4", "5", "6"]);
});

Deno.test("LFU use with ttl", async () => {
  const lfuCache = Velo.builder().ttl(100).capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  await sleep(300);
  assertEquals(lfuCache.size, 0);
  assertEquals(lfuCache.keys, []);
});

Deno.test("LFU forEach should print out the right key value pairs", () => {
  const lfuCache = Velo.builder<string, number>().capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.remove("5");
  const testKeys: string[] = [];
  lfuCache.forEach((i) => {
    testKeys.push(i.key);
  });
  assertEquals(testKeys, ["1", "2", "3", "4"]);
});

Deno.test("LFU get first entry, entry should not be deleted", () => {
  const lfuCache = Velo.builder().capacity(3).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.get("1");
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.set("6", 6);

  assertEquals(lfuCache.keys, ["1", "5", "6"]);
});

Deno.test("LFU should collect cache stats", () => {
  const lfuCache = Velo.builder().capacity(3).arc().stats().build();
  assertEquals(lfuCache.stats.hitCount, 0);
  assertEquals(lfuCache.stats.missCount, 0);

  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4); // evict
  lfuCache.get("1"); // miss
  lfuCache.get("2"); // hit
  lfuCache.get("3"); // hit
  lfuCache.get("4"); // hit

  assertEquals(lfuCache.stats.hitCount, 3);
  assertEquals(lfuCache.stats.missCount, 1);
});

Deno.test("LFU should call onEvict listener", () => {
  const lfuCache = Velo.builder()
    .capacity(3)
    .lfu()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4); // evicts "1"
});
