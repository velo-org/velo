import { assertEquals, assert } from "../test_deps.ts";
import { DEFAULT } from "../../mod.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { EventCapability } from "../../src/cache/capabilities/event_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("EventCapability, should wrap cache", () => {
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new EventCapability(cache, DEFAULT.eventOptions);
  assertEquals(cache instanceof EventCapability, true);
  assert(cache.events !== undefined);
});

Deno.test("EventCapability, should fire clear event", async () => {
  const cache = Velo.builder().capacity(5).lru().events().withEvent("clear").build();
  cache.set("key", "value");

  let fired = false;
  cache.events.on("clear", () => {
    assertEquals(cache.size, 0);
    fired = true;
  });

  cache.clear();
  await sleep(500);
  assert(fired);
});

Deno.test("EventCapability, should fire set event", async () => {
  const cache = Velo.builder().capacity(5).lru().events().withEvent("set").build();

  let fired = false;
  cache.events.on("set", (key, value) => {
    assertEquals(key, "key");
    assertEquals(value, "value");
    fired = true;
  });

  cache.set("key", "value");
  await sleep(500);
  assert(fired);
});

Deno.test("EventCapability, should fire get event", async () => {
  const cache = Velo.builder().capacity(5).lru().events().withEvent("get").build();

  let fired = false;
  cache.events.on("get", (key, value) => {
    assertEquals(key, "key");
    assertEquals(value, "value");
    fired = true;
  });

  cache.set("key", "value");
  cache.get("key");
  await sleep(500);
  assert(fired);
});

Deno.test("EventCapability, should fire get event, assert undefined", async () => {
  const cache = Velo.builder().capacity(5).lru().events().withEvent("get").build();

  let fired = false;
  cache.events.on("get", (key, value) => {
    assertEquals(key, "key");
    assertEquals(value, undefined);
    fired = true;
  });

  cache.get("key");
  await sleep(500);
  assert(fired);
});

Deno.test("EventCapability, should fire remove event", () => {
  const cache = Velo.builder().capacity(5).lru().events().withEvent("remove").build();
  cache.set("key", "value");

  cache.events.on("remove", (key) => {
    assertEquals(key, "key");
  });

  cache.remove("key");
});

Deno.test("EventCapability, should fire expire event with ExpireCapability", async () => {
  const cache = Velo.builder<string, string>().capacity(5).lru().ttl(200).events().withEvent("expire").build();

  let fired = false;
  cache.events.on("expire", (key, value) => {
    assertEquals(key, "key");
    assertEquals(value, "value");
    fired = true;
  });

  cache.set("key", "value");
  await sleep(1070);
  cache.get("key");
  assert(fired);
});
