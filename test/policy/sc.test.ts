import { Velo } from "../../src/builder/builder.ts";
import { SecondChance } from "../../src/policy/sc.ts";
import { assertEquals } from "../test_deps.ts";
import { sleep } from "../utils/sleep.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";

Deno.test("SC create Cache, should create a new empty cache", () => {
  const sc = new SecondChance(5);
  assertEquals(sc.size, 0);
});

Deno.test("SC, should return correct capacity", () => {
  const sc = new SecondChance(5);
  assertEquals(sc.capacity, 5);
});

Deno.test("SC create entry, and retrieve it", () => {
  const entry = { hello: "asdf" };
  const sc = new SecondChance(5);
  sc.set(1, entry);
  assertEquals(sc.get(1), entry);
});

Deno.test("SC get (non-existent) entry from empty cache, should return undefined", () => {
  const sc = new SecondChance(5);
  assertEquals(sc.get("key"), undefined);
});

Deno.test("SC get non-existent entry, should return undefined", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  assertEquals(sc.get("key"), undefined);
});

Deno.test("SC has, should return true if exists, false otherwise", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  assertEquals(sc.has("1"), true);
  assertEquals(sc.has("2"), false);
});

Deno.test("SC get removed entry, should return undefined", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.remove("3");
  assertEquals(sc.get("3"), undefined);
});

Deno.test("SC remove non existing, should return undefined", () => {
  const sc = new SecondChance(5);
  assertEquals(sc.remove("key"), undefined);
});

Deno.test("SC set overwrites old value", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("1", 2);
  assertEquals(sc.get("1"), 2);
});

Deno.test("SC set one more than allowed capacity, should not increase amount of keys", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.set("5", 5);
  sc.set("6", 6);
  assertEquals(sc.size, 5);
});

Deno.test("SC clear should reset cache", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.set("5", 5);
  sc.clear();
  assertEquals(sc.peek("3"), undefined);
  assertEquals(sc.size, 0);
});

Deno.test("SC forEach should print out the right key value pairs", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.set("5", 5);
  sc.remove("5");
  const testKeys = [];
  sc.forEach((entry) => {
    testKeys.push(entry.key);
  });
  assertEquals(testKeys.length, 4);
});

Deno.test("SC when getting value it receives a second chance, should not be deleted on the next turn", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.set("5", 5);
  sc.get("1");
  sc.set("6", 6);
  assertEquals(sc.peek("2"), undefined);
});

Deno.test("SC when getting value it receives a second chance, but should be deleted after two turns", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.set("5", 5);
  sc.get("1");
  sc.set("6", 6);
  assertEquals(sc.peek("1"), 1);
  sc.set("7", 7);
  assertEquals(sc.peek("1"), undefined);
});

Deno.test("SC should call onEvict listener", () => {
  const sc = Velo.builder()
    .capacity(3)
    .sc()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4); // evicts "1"
});

Deno.test("SC use with ttl", async () => {
  const sc = Velo.builder().capacity(5).sc().ttl(100).build();
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  sc.set("4", 4);
  sc.set("5", 5);
  await sleep(1070);
  sc.get("");
  assertEquals(sc.size, 0);
  assertEquals(sc.keys, []);
});

Deno.test("SC, should expose keys and values", () => {
  const sc = new SecondChance(5);
  sc.set("1", 1);
  sc.set("2", 2);
  sc.set("3", 3);
  assertEquals(sc.keys, ["1", "2", "3"]);
  assertEquals(sc.values, [1, 2, 3]);
});
