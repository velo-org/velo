// deno-lint-ignore-file no-explicit-any
import { WindowTinyLfu } from "../../src/policy/tiny_lfu/w_tiny_lfu.ts";
import { assert, assertThrows, assertEquals, assertFalse } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("TinyLFU create tinyLfu with small capacity, should throw error", () => {
  assertThrows(() => Velo.builder().capacity(5).tinyLfu().build());
  assertThrows(() => new WindowTinyLfu(5));
});

Deno.test("TinyLFU create tinyLfu, should create a new empty tinyLfu", () => {
  const tinyLfu = new WindowTinyLfu(100);
  assertEquals(tinyLfu.size, 0);
});

Deno.test("TinyLFU get existing entry, should return the value", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("key", true);
  assert(tinyLfu.get("key"));
});

Deno.test("TinyLFU get (non-existent) entry from empty tinyLfu, should return undefined", () => {
  const tinyLfu = new WindowTinyLfu(100);
  assertEquals(tinyLfu.get("key"), undefined);
});

Deno.test("TinyLFU get removed entry, should return undefined", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 4);
  tinyLfu.remove("3");
  assertEquals(tinyLfu.get("3"), undefined);
});

Deno.test("TinyLFU get non-existent entry, should return undefined", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 4);
  assertEquals(tinyLfu.get("key"), undefined);
});

Deno.test("TinyLFU peek existing entry, should return the value", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("key", true);
  assert(tinyLfu.peek("key"));
});

Deno.test("TinyLFU peek (non-existent) entry, should return undefined", () => {
  const tinyLfu = new WindowTinyLfu(100);
  assertEquals(tinyLfu.peek("key"), undefined);
});

Deno.test("TinyLFU has existant key, should return true", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("key", true);
  assert(tinyLfu.has("key"));
});

Deno.test("TinyLFU has (non-existent) key, should return false", () => {
  const tinyLfu = new WindowTinyLfu(100);
  assertEquals(tinyLfu.has("key"), false);
  tinyLfu.set("other_key", true);
  assertEquals(tinyLfu.has("key"), false);
});

Deno.test("TinyLFU remove (non-existent) key, should return undefined", () => {
  const tinyLfu = new WindowTinyLfu(100);
  assertEquals(tinyLfu.remove("key"), undefined);
});

Deno.test("TinyLFU clear, should clear the cache", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("1", 1);
  tinyLfu.clear();
  assertFalse(tinyLfu.has("1"));
  assertEquals((tinyLfu as any).window.size(), 0);
  assertEquals((tinyLfu as any).probation.size(), 0);
  assertEquals((tinyLfu as any).protected.size(), 0);
});

Deno.test("TinyLFU single access entries fill window and probationary, should not enter protected", () => {
  const tinyLfu = new WindowTinyLfu(100);
  for (let i = 0; i < 100; i++) {
    tinyLfu.set(i, i);
  }
  assertEquals(tinyLfu.size, 21);
  assertEquals((tinyLfu as any).window.size(), 1);
  assertEquals((tinyLfu as any).probation.size(), 20);
});

Deno.test("TinyLFU double accessed entry in probation should be promoted to protected segment", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 1); // to fill the window
  tinyLfu.get("1");

  assertEquals(tinyLfu.size, 2);
  assertEquals((tinyLfu as any).protected.size(), 1);
});

Deno.test("TinyLFU full tinyLfu acces twice, should promote and increase size", () => {
  const tinyLfu = new WindowTinyLfu(100);
  for (let i = 0; i < 100; i++) {
    tinyLfu.set(i, i);
  }
  assertEquals(tinyLfu.size, 21);
  assertEquals((tinyLfu as any).window.size(), 1);
  assertEquals((tinyLfu as any).probation.size(), 20);

  tinyLfu.get(98);
  tinyLfu.set(1000, 1000);

  assertEquals(tinyLfu.size, 22);
  assertEquals((tinyLfu as any).window.size(), 1);
  assertEquals((tinyLfu as any).probation.size(), 20);
  assertEquals((tinyLfu as any).protected.size(), 1);
  assertEquals((tinyLfu as any).protected.keys(), [98]);
});

Deno.test(
  "TinyLFU set existent key in window and window cache is full, should update the value and move it to the protected segment (2x accessed)",
  () => {
    const tinyLfu = new WindowTinyLfu(100); // window size is 1
    tinyLfu.set("1", 1);
    tinyLfu.set("1", 2);
    assertEquals(tinyLfu.get("1"), 2);
    assertEquals((tinyLfu as any).protected.size(), 1);
    assertEquals((tinyLfu as any).window.size(), 0);
  }
);

Deno.test("TinyLFU set existent key in window and window is not full, should keep it in the window segment", () => {
  const tinyLfu = new WindowTinyLfu(500); // window size is 5
  tinyLfu.set("1", 1);
  tinyLfu.set("1", 2);
  assertEquals(tinyLfu.get("1"), 2);
  assertEquals((tinyLfu as any).window.size(), 1);
  assertEquals((tinyLfu as any).protected.size(), 0);
});

Deno.test("TinyLFU should place entries in correct segment", () => {
  const tinyLfu = new WindowTinyLfu(200);
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 2);
  tinyLfu.set("5", 4);
  tinyLfu.get("1");

  assertEquals(tinyLfu.size, 5);
  assertEquals((tinyLfu as any).protected.size(), 1);
  assertEquals((tinyLfu as any).probation.size(), 2);
  assertEquals((tinyLfu as any).window.size(), 2);

  assertEquals((tinyLfu as any).protected.keys(), ["1"]);
  assertEquals((tinyLfu as any).probation.keys(), ["2", "3"]);
  assertEquals((tinyLfu as any).window.keys(), ["5", "4"]);
});

Deno.test("TinyLFU forEach should print out the right key value pairs", () => {
  const tinyLfu = new WindowTinyLfu<string, number>(100);
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 4);
  tinyLfu.set("5", 5);
  tinyLfu.remove("3");
  const testKeys: string[] = [];
  tinyLfu.forEach((e) => {
    testKeys.push(e.key);
  });
  assertEquals(testKeys, ["5", "4", "2", "1"]);
});

Deno.test("TinyLFU use with ttl", async () => {
  const tinyLfu = Velo.builder().capacity(100).ttl(100).tinyLfu().build();
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 4);
  tinyLfu.set("5", 5);
  await sleep(1070);
  tinyLfu.get("");
  assertEquals(tinyLfu.size, 0);
  assertEquals(tinyLfu.keys, []);
});

Deno.test("TinyLFU should collect tinyLfu stats", () => {
  const tinyLfu = Velo.builder().capacity(100).tinyLfu().stats().build();
  assertEquals(tinyLfu.stats.hitCount, 0);
  assertEquals(tinyLfu.stats.missCount, 0);

  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.get("1"); // hit
  tinyLfu.get("2"); // hit
  tinyLfu.get("3"); // hit
  tinyLfu.get("4"); // miss

  assertEquals(tinyLfu.stats.hitCount, 3);
  assertEquals(tinyLfu.stats.missCount, 1);
});

Deno.test("TinyLFU should call onEvict listener", () => {
  const tinyLfu = Velo.builder()
    .capacity(100)
    .tinyLfu()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 4); // evicts "1"
});

Deno.test("TinyLFU should expose key and value arrays", () => {
  const tinyLfu = new WindowTinyLfu(100);
  tinyLfu.set("1", 1);
  tinyLfu.set("2", 2);
  tinyLfu.set("3", 3);
  tinyLfu.set("4", 4);
  assertEquals(tinyLfu.keys, ["4", "1", "2", "3"]);
  assertEquals(tinyLfu.values, [4, 1, 2, 3]);
});
