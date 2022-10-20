import { assertEquals, assertFalse, assertThrows } from "../dev_deps.ts";
import { Velo } from "../src/builder/builder.ts";
import { Options } from "../src/cache/options.ts";
import { LRU } from "../src/policy/lru.ts";

Deno.test("Cache, should allow to extract cache options", () => {
  const options = new Options<number, string>();
  options.capacity = 5;
  options.ttl = 1000;
  options.stats = true;
  options.policy = new LRU(100);

  const cache = Velo.from(options).build();
  assertEquals(cache.options, options);
});

Deno.test("Cache, should throw error on events getter", () => {
  const cache = Velo.builder().capacity(5).lru().build();
  assertThrows(() => cache.events);
});

Deno.test("Cache, should throw error on stats getter", () => {
  const cache = Velo.builder().capacity(5).lru().build();
  assertThrows(() => cache.stats);
});

Deno.test("Cache, should not have refresh method", () => {
  const cache = Velo.builder().capacity(5).lru().build();
  assertFalse(Reflect.has(cache, "refresh"));
});
