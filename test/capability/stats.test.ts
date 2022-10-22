import { assert, assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { Counter } from "../../src/cache/capabilities/counter.ts";
import { StatisticsCapability } from "../../src/cache/capabilities/stats_capability.ts";

Deno.test("StatisticsCapability, should wrap cache", () => {
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new StatisticsCapability(cache, new Counter());
  assertEquals(cache instanceof StatisticsCapability, true);
  assert(cache.stats !== undefined);
});

Deno.test("StatisticsCapability, should return statistics", () => {
  const cache = Velo.builder().capacity(5).lru().stats().build();
  assertEquals(cache.stats.hitCount, 0);
  assertEquals(cache.stats.missCount, 0);
  assertEquals(cache.stats.hitRate, NaN);
});
