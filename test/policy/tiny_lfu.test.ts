import { assert, assertThrows, assertEquals } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { getPolicy } from "./get_policy.test.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("TinyLFU create cache with small capacity, should throw error", () => {
  assertThrows(() => Velo.builder().capacity(5).tinyLfu().build());
});

Deno.test("TinyLFU create cache, should create a new empty cache", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  assertEquals(cache.size, 0);
});

Deno.test("TinyLFU, should return correct capacity", () => {
  const cache = Velo.builder().capacity(5).sc().build();
  assertEquals(cache.capacity, 5);
});

Deno.test("TinyLFU get existing entry, should return the value", () => {
  const cache = Velo.builder<string, boolean>().capacity(100).tinyLfu().build();
  cache.set("key", true);
  assert(cache.get("key"));
});

Deno.test("TinyLFU get (non-existent) entry from empty cache, should return undefined", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  assertEquals(cache.get("key"), undefined);
});

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

Deno.test("TinyLFU single access entries fill window and probationary, should not enter protected", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  for (let i = 0; i < 100; i++) {
    cache.set(i, i);
  }
  assertEquals(cache.size, 21);
  assertEquals(getPolicy(cache).window.size(), 1);
  assertEquals(getPolicy(cache).probation.size(), 20);
});

Deno.test("TinyLFU double accessed entry in probation should be promoted to protected segment", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 1); // to fill the window
  cache.get("1");

  assertEquals(cache.size, 2);
  assertEquals(getPolicy(cache).protected.size(), 1);
});

Deno.test("TinyLFU full cache acces twice, should promote and increase size", () => {
  const cache = Velo.builder().capacity(100).tinyLfu().build();
  for (let i = 0; i < 100; i++) {
    cache.set(i, i);
  }
  assertEquals(cache.size, 21);
  assertEquals(getPolicy(cache).window.size(), 1);
  assertEquals(getPolicy(cache).probation.size(), 20);

  cache.get(98);
  cache.set(1000, 1000);

  assertEquals(cache.size, 22);
  assertEquals(getPolicy(cache).window.size(), 1);
  assertEquals(getPolicy(cache).probation.size(), 20);
  assertEquals(getPolicy(cache).protected.size(), 1);
  assertEquals(getPolicy(cache).protected.keys(), [98]);
});

Deno.test("TinyLFU should place entries in correct segment", () => {
  const cache = Velo.builder().capacity(200).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 2);
  cache.set("5", 4);
  cache.get("1");

  assertEquals(cache.size, 5);
  assertEquals(getPolicy(cache).protected.size(), 1);
  assertEquals(getPolicy(cache).probation.size(), 2);
  assertEquals(getPolicy(cache).window.size(), 2);

  assertEquals(getPolicy(cache).protected.keys(), ["1"]);
  assertEquals(getPolicy(cache).probation.keys(), ["2", "3"]);
  assertEquals(getPolicy(cache).window.keys(), ["5", "4"]);
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
  const cache = Velo.builder().capacity(100).ttl(100).tinyLfu().build();
  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4);
  cache.set("5", 5);
  await sleep(1070);
  cache.get("");
  assertEquals(cache.size, 0);
  assertEquals(cache.keys, []);
});

Deno.test("TinyLFU should collect cache stats", () => {
  const cache = Velo.builder().capacity(3).arc().stats().build();
  assertEquals(cache.stats.hitCount, 0);
  assertEquals(cache.stats.missCount, 0);

  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4); // evict
  cache.get("1"); // miss
  cache.get("2"); // hit
  cache.get("3"); // hit
  cache.get("4"); // hit

  assertEquals(cache.stats.hitCount, 3);
  assertEquals(cache.stats.missCount, 1);
});

Deno.test("TinyLFU should call onEvict listener", () => {
  const cache = Velo.builder()
    .capacity(3)
    .lru()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  cache.set("1", 1);
  cache.set("2", 2);
  cache.set("3", 3);
  cache.set("4", 4); // evicts "1"
});
