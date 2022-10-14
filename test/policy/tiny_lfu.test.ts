import { assert, assertEquals, assertThrows } from "../../dev_deps.ts";
import { Velo } from "../../src/cache/builder.ts";
import { sleep } from "../../src/utils/sleep.ts";

Deno.test(
  "TinyLFU create cache with small capacity, should throw error",
  () => {
    assertThrows(() => Velo.builder().capacity(5).tinyLfu().build());
  }
);

Deno.test("TinyLFU create cache, should create a new empty cache", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  assertEquals(cache.size, 0);
});

Deno.test("TinyLFU get existing entry, should return the value", () => {
  const cache = Velo.builder<string, boolean>().capacity(100).tinyLfu().build();
  cache.set("key", true);
  assert(cache.get("key"));
});

Deno.test(
  "TinyLFU get (non-existent) entry from empty cache, should return undefined",
  () => {
    const cache = Velo.builder().capacity(100).tinyLfu().build();
    assertEquals(cache.get("key"), undefined);
  }
);

Deno.test("TinyLFU get non-existent entry, should return undefined", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4);
  assertEquals(cache.get("key"), undefined);
});

Deno.test("TinyLFU get removed entry, should return undefined", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4);
  cache.remove("3");
  assertEquals(cache.get("3"), undefined);
});

Deno.test(
  "TinyLFU single access entries fill window and probationary, should not enter protected",
  () => {
    const cache = Velo.builder().capacity(100).tinyLfu().build();
    for (let i = 0; i < 100; i++) {
      cache.set(i, i);
    }
    assertEquals(cache.size, 21);
    assertEquals((cache as any)._policy.window.size(), 1);
    assertEquals((cache as any)._policy.probation.size(), 20);
  }
);

Deno.test(
  "TinyLFU double accessed entry in probation should be promoted to protected segment",
  () => {
    const cache = Velo.builder().capacity(100).tinyLfu().build();
    cache.set("1", 1);
    cache.set("2", 1); // to fill the window
    cache.get("1");

    assertEquals(cache.size, 2);
    assertEquals((cache as any)._policy.protected.size(), 1);
  }
);

Deno.test("TinyLFU should place entries in correct segment", () => {
  const cache = Velo.builder().capacity(200).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 2);
  cache.set("5", 4);
  cache.get("1");

  assertEquals(cache.size, 5);
  assertEquals((cache as any)._policy.protected.size(), 1);
  assertEquals((cache as any)._policy.probation.size(), 2);
  assertEquals((cache as any)._policy.window.size(), 2);

  assertEquals((cache as any)._policy.protected.keys(), ["1"]);
  assertEquals((cache as any)._policy.probation.keys(), ["2", "3"]);
  assertEquals((cache as any)._policy.window.keys(), ["5", "4"]);
});

Deno.test("TinyLFU forEach should print out the right key value pairs", () => {
  const cache = Velo.builder<string, number>().capacity(100).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4);
  cache.set("5", 5);
  cache.remove("3");
  const testKeys: string[] = [];
  cache.forEach((e) => {
    testKeys.push(e.key);
  });
  assertEquals(testKeys, ["5", "4", "2", "1"]);
});

Deno.test("TinyLFU use with ttl", async () => {
  const cache = Velo.builder().capacity(100).ttl(200).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4);
  cache.set("5", 5);
  await sleep(1000);
  assertEquals(cache.size, 0);
  assertEquals(cache.keys, []);
});

Deno.test("TinyLFU should collect cache stats", () => {
  const arcCache = Velo.builder().capacity(3).arc().stats().build();
  assertEquals(arcCache.stats.evictCount, 0);
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
  assertEquals(arcCache.stats.evictCount, 1);
});
