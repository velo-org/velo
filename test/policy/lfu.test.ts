import { assert, assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { sleep } from "../../src/utils/sleep.ts";

Deno.test("LFU create cache, should create a new empty cache", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  assertEquals(lfuCache.size, 0);
});

Deno.test("LFU get existing entry, should return the value", () => {
  const lfuCache = Velo.builder().capacity(5).lfu().build();
  lfuCache.set("key", true);
  assert(lfuCache.get("key"));
});

Deno.test(
  "LFU get (non-existent) entry from empty cache, should return undefined",
  () => {
    const lfuCache = Velo.builder().capacity(5).lfu().build();
    assertEquals(lfuCache.get("key"), undefined);
  }
);

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

Deno.test(
  "LFU set one more than allowed capacity, should not increase amount of keys",
  () => {
    const lfuCache = Velo.builder().capacity(5).lfu().build();
    lfuCache.set("1", 1);
    lfuCache.set("2", 2);
    lfuCache.set("3", 3);
    lfuCache.set("4", 4);
    lfuCache.set("5", 5);
    lfuCache.set("6", 6);
    assertEquals(lfuCache.size, 5);
  }
);

Deno.test(
  "LFU set one more than allowed capacity, should evict first inserted key",
  () => {
    const lfuCache = Velo.builder().capacity(5).lfu().build();
    lfuCache.set("1", 1);
    lfuCache.set("2", 2);
    lfuCache.set("3", 3);
    lfuCache.set("4", 4);
    lfuCache.set("5", 5);
    lfuCache.set("6", 6);
    assert(!lfuCache.has("1"));
  }
);

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
  const lfuCache = Velo.builder().ttl(200).capacity(5).lfu().build();
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  await sleep(500);
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
