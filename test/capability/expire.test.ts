// deno-lint-ignore-file no-explicit-any
import { assertEquals, assert, assertThrows } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { ExpireCapability } from "../../src/cache/capabilities/expire_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("ExpireCapability, should wrap cache", () => {
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new ExpireCapability(cache, 500, { refreshOnRead: false, refreshOnWrite: false });
  assertEquals(cache instanceof ExpireCapability, true);
  assert((cache as any).ttl !== undefined);
});

Deno.test("ExpireCapability, should remove entry after timeout", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  cache.set("key", "value");
  await sleep(1070);
  cache.get("key");
  assertEquals(cache.size, 0);
});

Deno.test("ExpireCapability, should reject ttl <= 0 for setWithExpire", () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertThrows(() => cache.setWithExpire("key", "value", 0));
  assertThrows(() => cache.setWithExpire("key", "value", -1));
});

Deno.test("ExpireCapability, should refresh timeout", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(1500, { refreshOnRead: true, refreshOnWrite: true }).build();
  cache.set("key1", "value");
  cache.set("key2", "value");

  await sleep(1070);

  cache.set("key1", "new_value");
  cache.get("key2");

  await sleep(1070);

  assertEquals(cache.size, 2);
});

const getTime = (cache: any): number => cache.timerWheel.time;

Deno.test("ExpireCapability, should advance timer wheel on get", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertEquals(getTime(cache), 0);
  await sleep(1000);
  cache.get("key");
  assert(getTime(cache) > 0);
});

Deno.test("ExpireCapability, should advance timer wheel on has", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertEquals(getTime(cache), 0);
  await sleep(1000);
  cache.has("key");
  assert(getTime(cache) > 0);
});

Deno.test("ExpireCapability, should advance timer wheel on peek", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertEquals(getTime(cache), 0);
  await sleep(1000);
  cache.peek("key");
  assert(getTime(cache) > 0);
});

Deno.test("ExpireCapability, should advance timer wheel on remove", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertEquals(getTime(cache), 0);
  await sleep(1000);
  cache.remove("key");
  assert(getTime(cache) > 0);
});

Deno.test("ExpireCapability, should advance timer wheel on forEach", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertEquals(getTime(cache), 0);
  await sleep(1000);
  cache.forEach(() => {});
  assert(getTime(cache) > 0);
});

Deno.test("ExpireCapability, should clear timer wheel on reset", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  assertEquals(getTime(cache), 0);
  await sleep(1000);
  (cache as any).timerWheel.advance();
  assert(getTime(cache) > 0);
  cache.reset();
  assertEquals(getTime(cache), 0);
});
