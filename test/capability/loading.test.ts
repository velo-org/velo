import { assertEquals, assertThrows } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { LoadingCapability } from "../../src/cache/capabilities/loading_capability.ts";

Deno.test("LoadingCapability, should wrap cache", () => {
  const loadFunc = (_: string) => "";
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new LoadingCapability(cache, loadFunc);
  assertEquals(cache instanceof LoadingCapability, true);
});

Deno.test("LoadingCapability, should load value if not present", () => {
  const loadFunc = (k: number) => k + 1;
  const cache = Velo.builder<number, number>().capacity(5).lru().build(loadFunc);
  assertEquals(cache.get(1), loadFunc(1));
});

Deno.test("LoadingCapability, should not load value if already in the cache", () => {
  const cache = Velo.builder<number, string>()
    .capacity(5)
    .lru()
    .build(() => {
      return "loaded";
    });

  cache.set(1, "already in cache");
  assertEquals(cache.get(1), "already in cache");
});

Deno.test("LoadingCapability, should refresh value", () => {
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

Deno.test("LoadingCapability, should re-throw errors that occur inside the loading function", () => {
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
