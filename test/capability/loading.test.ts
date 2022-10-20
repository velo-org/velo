import { assert, assertEquals, assertThrows } from "../../dev_deps.ts";
import { Velo } from "../../mod.ts";
import { LoadingCapability } from "../../src/cache/capability/loading/loading_capability.ts";

Deno.test("LoadingCapability, should create a loading cache instance", () => {
  const cache = Velo.builder<string, string>()
    .capacity(5)
    .lru()
    .build((k: string) => {
      return k + "1";
    });

  assert(cache instanceof LoadingCapability);
  assert(Reflect.has(cache, "refresh"));
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

  cache.set(1, "valid value");
  assertEquals(cache.get(1), "valid value");
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
