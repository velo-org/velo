import { Velo } from "../../src/builder/builder.ts";
import { assertEquals } from "../test_deps.ts";
import { sleep } from "../utils/sleep.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";

Deno.test("SC create Cache, should create a new empty cache", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  assertEquals(scCache.size, 0);
});

Deno.test("SC create entry, and retrieve it", () => {
  const entry = { hello: "asdf" };
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set(1, entry);
  assertEquals(scCache.get(1), entry);
});

Deno.test("SC, should return correct capacity", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  assertEquals(scCache.capacity, 5);
});

Deno.test("SC get (non-existent) entry from empty cache, should return undefined", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  assertEquals(scCache.get("key"), undefined);
});

Deno.test("SC get non-existent entry, should return undefined", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  assertEquals(scCache.get("key"), undefined);
});

Deno.test("SC remove entry, should return undefined", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.remove("3");
  assertEquals(scCache.get("3"), undefined);
});

Deno.test("SC set one more than allowed capacity, should not increase amount of keys", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.set("6", 6);
  assertEquals(scCache.size, 5);
});

Deno.test("SC clear should reset cache", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.reset();
  assertEquals(scCache.peek("3"), undefined);
  assertEquals(scCache.size, 0);
});

Deno.test("SC use with ttl", async () => {
  const scCache = Velo.builder().capacity(5).sc().ttl(100).build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  await sleep(1070);
  scCache.get("");
  assertEquals(scCache.size, 0);
  assertEquals(scCache.keys, []);
});

Deno.test("SC forEach should print out the right key value pairs", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.remove("5");
  const testKeys = [];
  scCache.forEach((entry) => {
    testKeys.push(entry.key);
  });
  assertEquals(testKeys.length, 4);
});

Deno.test("SC when getting value it receives a second chance, should not be deleted on the next turn", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.get("1");
  scCache.set("6", 6);
  assertEquals(scCache.peek("2"), undefined);
});

Deno.test("SC when getting value it receives a second chance, but should be deleted after two turns", () => {
  const scCache = Velo.builder().capacity(5).sc().build();
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.get("1");
  scCache.set("6", 6);
  assertEquals(scCache.peek("1"), 1);
  scCache.set("7", 7);
  assertEquals(scCache.peek("1"), undefined);
});

Deno.test("SC should call onEvict listener", () => {
  const scCache = Velo.builder()
    .capacity(3)
    .lru()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4); // evicts "1"
});
