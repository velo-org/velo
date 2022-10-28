// deno-lint-ignore-file no-explicit-any
import { Arc } from "../../src/policy/arc.ts";
import { assertEquals, assert } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("ARC create cache, should create a new empty cache", () => {
  const arc = new Arc(5);
  assertEquals(arc.size, 0);
});

Deno.test("ARC, should return correct capacity", () => {
  const arc = new Arc(5);
  assertEquals(arc.capacity, 5);
});

Deno.test("ARC get existing entry, should return the value", () => {
  const arc = new Arc(5);
  arc.set("key", true);
  assert(arc.get("key"));
});

Deno.test("ARC get (non-existent) entry from empty cache, should return undefined", () => {
  const arc = new Arc(5);
  assertEquals(arc.get("key"), undefined);
});

Deno.test("ARC get non-existent entry, should return undefined", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  assertEquals(arc.get("key"), undefined);
});

Deno.test("ARC get removed entry, should return undefined", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  arc.remove("3");
  assertEquals(arc.get("3"), undefined);
});

Deno.test("ARC peek in t1, should return value", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  assertEquals(arc.peek("1"), 1);
});

Deno.test("ARC peek in t2, should return value", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.get("1");
  arc.get("1");
  assertEquals(arc.peek("1"), 1);
});

Deno.test("ARC peek non existent, should return undefined", () => {
  const arc = new Arc(5);
  assertEquals(arc.peek("1"), undefined);
});

Deno.test("ARC set after capacity reached, should evict to maintain capacity", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  arc.set("5", 5);
  arc.set("6", 6);
  assertEquals(arc.size, 5);
});

Deno.test("ARC set after capacity reached, should evict first inserted key", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  arc.set("5", 5);
  arc.set("6", 6);
  assert(!arc.has("1"));
});

Deno.test("ARC remove from t1 and t2, should return the value", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  let removed = arc.remove("1");
  assertEquals(removed, 1);
  arc.set("1", 1);
  arc.set("1", 1);
  removed = arc.remove("1");
  assertEquals(removed, 1);
});

Deno.test("ARC remove non existent, should return undefined", () => {
  const arc = new Arc(5);
  assertEquals(arc.remove("1"), undefined);
});

Deno.test("ARC clear, should reset the cache", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("2", 2);
  arc.clear();
  assertEquals(arc.size, 0);
});

Deno.test("ARC immediate full scan, should evict all keys", () => {
  const arc = new Arc(3);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  arc.set("5", 5);
  arc.set("6", 6);

  assertEquals(arc.keys, ["4", "5", "6"]);
});

Deno.test("ARC forEach should print out the right key value pairs", () => {
  const arc = new Arc<string, number>(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  arc.set("5", 5);
  arc.remove("3");
  const testKeys: string[] = [];
  arc.forEach((e, _) => {
    testKeys.push(e.key);
  });
  assertEquals(testKeys, ["5", "4", "2", "1"]);
});

Deno.test("ARC use with ttl", async () => {
  const arc = Velo.builder().capacity(5).ttl(100).arc().build();
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4);
  arc.set("5", 5);
  await sleep(1070);
  arc.get("");
  assertEquals(arc.size, 0);
  assertEquals(arc.keys, []);
});

Deno.test("ARC getting entry from t1, should move it to t2", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.get("3");
  assertEquals((arc as any).t2.keys, ["3"]); // frequently set
});

Deno.test(
  "ARC setting entry that was evicted from t1, should remove it from b1 into t2 and also evict the last entry from t1 into b1",
  () => {
    const arc = new Arc(5);
    arc.set("1", 1);
    arc.set("2", 2);
    arc.set("3", 3);
    arc.set("4", 4);
    arc.set("5", 5);
    arc.set("6", 6);
    assertEquals((arc as any).b1.keys, ["1"]); // recently evicted
    arc.set("1", 1);
    assertEquals((arc as any).b1.keys, ["2"]); // recently evicted
    assertEquals((arc as any).t1.keys, ["6", "3", "4", "5"]); // recently set
    assertEquals((arc as any).t2.keys, ["1"]); // frequently set
  }
);

Deno.test("ARC should collect cache stats", () => {
  const arc = Velo.builder().capacity(3).arc().stats().build();
  assertEquals(arc.stats.hitCount, 0);
  assertEquals(arc.stats.missCount, 0);

  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4); // evict
  arc.get("1"); // miss
  arc.get("2"); // hit
  arc.get("3"); // hit
  arc.get("4"); // hit

  assertEquals(arc.stats.hitCount, 3);
  assertEquals(arc.stats.missCount, 1);
});

Deno.test("ARC should call onEvict listener", () => {
  const arc = Velo.builder()
    .capacity(3)
    .arc()
    .removalListener((k, v, cause) => {
      assertEquals(k, "1");
      assertEquals(v, 1);
      assertEquals(cause, RemoveCause.Evicted);
    })
    .build();

  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  arc.set("4", 4); // evicts "1"
});

Deno.test("ARC, should expose keys and values", () => {
  const arc = new Arc(5);
  arc.set("1", 1);
  arc.set("2", 2);
  arc.set("3", 3);
  assertEquals(arc.keys, ["1", "2", "3"]);
  assertEquals(arc.values, [1, 2, 3]);
});

Deno.test("ARC, evict from t2", () => {
  const arc = new Arc(2);
  arc.set("1", 0);
  arc.set("2", 0);
  arc.set("3", 0);
  arc.set("1", 0);
  arc.set("2", 0);
  arc.set("3", 0);
  arc.set("1", 0);
  arc.set("2", 0);
  arc.set("3", 0);
  arc.set("4", 0);
  assertEquals(arc.keys, ["4", "3"]);
  assertEquals((arc as any).t1.keys, ["4"]);
  assertEquals((arc as any).t2.keys, ["3"]);
  assertEquals((arc as any).b2.keys, ["2"]);
});
