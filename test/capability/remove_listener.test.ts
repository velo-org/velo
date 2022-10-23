import { assertEquals, assert } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { RemoveCause, RemoveListenerCapability } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("RemoveListenerCapability, should wrap cache", () => {
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new RemoveListenerCapability(cache, () => {});
  assertEquals(cache instanceof RemoveListenerCapability, true);
  assert(cache.onRemove !== undefined);
});

Deno.test("RemoveListenerCapability, should call when removed by user", () => {
  let entered = false;

  const cache = Velo.builder<string, string>()
    .capacity(5)
    .lru()
    .removalListener((key, value, cause) => {
      assertEquals(key, "key");
      assertEquals(value, "value");
      assertEquals(cause, RemoveCause.Explicit);
      entered = true;
    })
    .build();

  cache.set("key", "value");
  cache.remove("key");
  assert(entered);
});

Deno.test("RemoveListenerCapability, should call when removed by policy eviction", () => {
  let entered = false;

  const cache = Velo.builder<string, string>()
    .capacity(3)
    .lru()
    .removalListener((key, value, cause) => {
      assertEquals(key, "key1");
      assertEquals(value, "value");
      assertEquals(cause, RemoveCause.Evicted);
      entered = true;
    })
    .build();

  cache.set("key1", "value");
  cache.set("key2", "value");
  cache.set("key3", "value");
  cache.set("key4", "value");
  assert(entered);
});

Deno.test("RemoveListenerCapability, should call when replaced by other value", () => {
  let entered = false;

  const cache = Velo.builder<string, string>()
    .capacity(3)
    .lru()
    .removalListener((key, value, cause) => {
      assertEquals(key, "key");
      assertEquals(value, "value1");
      assertEquals(cause, RemoveCause.Replaced);
      entered = true;
    })
    .build();

  cache.set("key", "value1");
  cache.set("key", "value2");
  assert(entered);
});

Deno.test("RemoveListenerCapability, should call when expired with ExpireCapability", async () => {
  let entered = false;

  const cache = Velo.builder<string, string>()
    .capacity(3)
    .lru()
    .ttl(100)
    .removalListener((key, value, cause) => {
      assertEquals(key, "key");
      assertEquals(value, "value");
      assertEquals(cause, RemoveCause.Expired);
      entered = true;
    })
    .build();

  cache.set("key", "value");
  await sleep(1070);
  cache.get("key");
  assert(entered);
});

Deno.test("RemoveListenerCapability, should allow async listener", async () => {
  let entered = false;

  const cache = Velo.builder<string, string>()
    .capacity(5)
    .lru()
    .removalListener(async (key) => {
      await sleep(100);
      assertEquals(key, "key");
      entered = true;
    })
    .build();

  cache.set("key", "value");
  cache.remove("key");
  await sleep(300);
  assert(entered);
});
