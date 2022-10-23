import { assertEquals, assert } from "../test_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { ExtractOptionsCapability } from "../../src/cache/capabilities/extract_options_capability.ts";
import { Options } from "../../src/cache/options.ts";
import { Lru } from "../../src/policy/lru.ts";

Deno.test("ExtractOptionsCapability, should wrap cache", () => {
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new ExtractOptionsCapability(cache, new Options());
  assertEquals(cache instanceof ExtractOptionsCapability, true);
  assert(cache.options !== undefined);
});

Deno.test("ExtractOptionsCapability, should return default options", () => {
  const cache = Velo.builder().build();
  assertEquals(cache.options, new Options());
});

Deno.test("ExtractOptionsCapability, should allow to extract cache options set with .from", () => {
  const options = new Options<number, string>();
  options.capacity = 5;
  options.ttl = 1000;
  options.stats = true;
  options.policy = new Lru(5);

  const cache = Velo.from(options).build();
  assertEquals(cache.options, options);
});
