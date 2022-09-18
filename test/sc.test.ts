import { SC } from "../src/caches/sc.ts";
import { assertEquals } from "../dev_deps.ts";
import { sleep } from "../src/utils/sleep.ts";

Deno.test("SC create Cache, should create a new empty cache", () => {
  const scCache = new SC({ capacity: 5 });
  assertEquals(scCache.size, 0);
});
Deno.test("SC create entry, and retrieve it", () => {
  const entry = { hello: "asdf" };
  const scCache = new SC({ capacity: 5 });
  scCache.set(1, entry);
  assertEquals(scCache.get(1), entry);
});
Deno.test(
  "SC get (non-existent) entry from empty cache, should return undefined",
  () => {
    const scCache = new SC({ capacity: 5 });
    assertEquals(scCache.get("key"), undefined);
  }
);

Deno.test("SC get non-existent entry, should return undefined", () => {
  const scCache = new SC({ capacity: 5 });
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  assertEquals(scCache.get("key"), undefined);
});
Deno.test("SC remove entry, should return undefined", () => {
  const scCache = new SC({ capacity: 5 });
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.remove("3");
  assertEquals(scCache.get("3"), undefined);
});

Deno.test(
  "SC set one more than allowed capacity, should not increase amount of keys",
  () => {
    const scCache = new SC({ capacity: 5 });
    scCache.set("1", 1);
    scCache.set("2", 2);
    scCache.set("3", 3);
    scCache.set("4", 4);
    scCache.set("5", 5);
    scCache.set("6", 6);
    assertEquals(scCache.size, 5);
  }
);

Deno.test("SC clear should reset cache", () => {
  const scCache = new SC({ capacity: 5 });
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.clear();
  assertEquals(scCache.peek("3"), undefined);
  assertEquals(scCache.size, 0);
});

Deno.test("SC use with ttl", async () => {
  const scCache = new SC({ capacity: 5, defaultTTL: 500 });
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  await sleep(600);
  assertEquals(scCache.size, 0);
  assertEquals(scCache.keys, []);
});

Deno.test("SC use with ttl, override ttl for specific set", async () => {
  const scCache = new SC({ capacity: 5, defaultTTL: 500 });
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5, 1000);
  await sleep(600);
  assertEquals(scCache.size, 1);
  assertEquals(scCache.keys, ["5"]);
  await sleep(400);
});
Deno.test("SC forEach should print out the right key value pairs", () => {
  const scCache = new SC({ capacity: 5 });
  scCache.set("1", 1);
  scCache.set("2", 2);
  scCache.set("3", 3);
  scCache.set("4", 4);
  scCache.set("5", 5);
  scCache.remove("5");
  const testKeys = [];
  scCache.forEach((i, _) => {
    testKeys.push(i.key);
  });
  assertEquals(testKeys.length, 4);
});

Deno.test(
  "SC when getting value it receives a second chance, should not be deleted on the next turn",
  () => {
    const scCache = new SC({ capacity: 5 });
    scCache.set("1", 1);
    scCache.set("2", 2);
    scCache.set("3", 3);
    scCache.set("4", 4);
    scCache.set("5", 5);
    scCache.get("1");
    scCache.set("6", 6);
    assertEquals(scCache.peek("2"), undefined);
  }
);
Deno.test(
  "SC when getting value it receives a second chance, but should be deleted after two turns",
  () => {
    const scCache = new SC({ capacity: 5 });
    scCache.set("1", 1);
    scCache.set("2", 2);
    scCache.set("3", 3);
    scCache.set("4", 4);
    scCache.set("5", 5);
    scCache.get("1");
    scCache.set("6", 6);
    scCache.set("7", 7);
    assertEquals(scCache.peek("1"), undefined);
  }
);
