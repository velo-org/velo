import { Velo } from "../src/builder/builder.ts";
import { sleep } from "../src/utils/sleep.ts";
import { assert, assertEquals, assertThrows } from "../dev_deps.ts";
import { LoadingCapability } from "../src/cache/capability/loading/loading_capability.ts";

Deno.test("CacheBuilder, should reject non-positive capacity", () => {
  assertThrows(() => Velo.builder().capacity(-5));
});

Deno.test("CacheBuilder, should reject non-positive TTL", () => {
  assertThrows(() => Velo.builder().ttl(-5));
  assertThrows(() => Velo.builder().ttl(0));
});

Deno.test("CacheBuilder, should reject multiple calls to same method", () => {
  assertThrows(() => Velo.builder().capacity(5).capacity(10));
  assertThrows(() => Velo.builder().ttl(5).ttl(10));
  assertThrows(() => Velo.builder().stats().stats());
  assertThrows(() => Velo.builder().events().events());
});

Deno.test("CacheBuilder, create a cache from Options object", () => {
  const cache_1 = Velo.builder().capacity(5).lru().build();
  const cache_2 = Velo.from(cache_1.options).build();
  assertEquals(cache_1.options, cache_2.options);
  assertEquals(cache_1.capacity, cache_2.capacity);
});

Deno.test("Cache, should fire clear event", async () => {
  const cache = Velo.builder().capacity(5).lru().events().setEvent("clear").build();
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

Deno.test("Cache, should fire set event", async () => {
  const cache = Velo.builder().capacity(5).lru().events().setEvent("set").build();

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

Deno.test("Cache, should fire remove event", () => {
  const cache = Velo.builder().capacity(5).lru().events().build();
  cache.set("key", "value");

  cache.events.on("remove", (key) => {
    assertEquals(key, "key");
  });

  cache.remove("key");
});

Deno.test("LoadingCache, should be a loading Cache", () => {
  const cache = Velo.builder<string, string>()
    .capacity(5)
    .lru()
    .build((k: string) => {
      return k + "1";
    });

  assert(cache instanceof LoadingCapability);
  assert(Reflect.has(cache, "refresh"));
});

Deno.test("LoadingCache, should load value if not present", () => {
  const loadFunc = (k: number) => k + 1;
  const cache = Velo.builder<number, number>().capacity(5).lru().build(loadFunc);
  assertEquals(cache.get(1), loadFunc(1));
});

Deno.test("LoadingCache, should not load value if already in the cache", () => {
  const cache = Velo.builder<number, string>()
    .capacity(5)
    .lru()
    .build(() => {
      return "loaded";
    });

  cache.set(1, "valid value");
  assertEquals(cache.get(1), "valid value");
});

Deno.test("LoadingCache, should refresh value", () => {
  const cache = Velo.builder<number, number>()
    .capacity(5)
    .lru()
    .build((k) => {
      return k + 1;
    });
  cache.set(1, -2);
  cache.refresh(1);

  assertEquals(cache.get(1), 2);
});

Deno.test("LoadingCache, should re-throw errors that occur inside the loading function", () => {
  const cache = Velo.builder<number, number>()
    .capacity(5)
    .lru()
    .build((k) => {
      if (k === 0) {
        throw new Deno.errors.InvalidData("Zero Key");
      }
      return k + 1;
    });

  assertThrows(() => cache.get(0), Deno.errors.InvalidData, "Zero Key");
});
