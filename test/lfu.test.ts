import { LFU } from "../src/caches/lfu.ts";
import { assert, assertEquals } from "../dev_deps.ts";
import { sleep } from "../src/utils/sleep.ts";

Deno.test("LFU create cache, should create a new empty cache", () => {
  const lfuCache = new LFU({ capacity: 5 });
  assertEquals(lfuCache.size, 0);
});

Deno.test("LFU get existing entry, should return the value", () => {
  const lfuCache = new LFU({ capacity: 5 });
  lfuCache.set("key", true);
  assert(lfuCache.get("key"));
});

Deno.test(
  "LFU get (non-existent) entry from empty cache, should return undefined",
  () => {
    const lfuCache = new LFU({ capacity: 5 });
    assertEquals(lfuCache.get("key"), undefined);
  }
);

Deno.test("LFU get non-existent entry, should return undefined", () => {
  const lfuCache = new LFU({ capacity: 5 });
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  assertEquals(lfuCache.get("key"), undefined);
});

Deno.test("LFU get removed entry, should return undefined", () => {
  const lfuCache = new LFU({ capacity: 5 });
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
    const lfuCache = new LFU({ capacity: 5 });
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
    const lfuCache = new LFU({ capacity: 5 });
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
  const lfuCache = new LFU({ capacity: 3 });
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.set("6", 6);

  assertEquals(lfuCache.keys, ["4", "5", "6"]);
});
Deno.test("LFU use with ttl", async () => {
  const lfuCache = new LFU({ capacity: 5, defaultTTL: 500 });
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  await sleep(600);
  assertEquals(lfuCache.size, 0);
  assertEquals(lfuCache.keys, []);
});
Deno.test("LFU forEach should print out the right key value pairs", () => {
  const lfuCache = new LFU({ capacity: 5 });
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.remove("5");
  const testKeys = [];
  lfuCache.forEach((i, index) => {
    testKeys.push(i.key);
  });
  assertEquals(testKeys.length, 4);
});

Deno.test("LFU use with ttl, override ttl for specific set", async () => {
  const lfuCache = new LFU({ capacity: 5, defaultTTL: 500 });
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.set("4", 4);
  lfuCache.set("5", 5, 1000);
  await sleep(600);
  assertEquals(lfuCache.size, 1);
  assertEquals(lfuCache.keys, ["5"]);
  await sleep(400);
});

Deno.test("LFU get first entry, entry should not be deleted", () => {
  const lfuCache = new LFU({ capacity: 3 });
  lfuCache.set("1", 1);
  lfuCache.set("2", 2);
  lfuCache.set("3", 3);
  lfuCache.get("1");
  lfuCache.set("4", 4);
  lfuCache.set("5", 5);
  lfuCache.set("6", 6);

  assertEquals(lfuCache.keys, ["1", "5", "6"]);
});
