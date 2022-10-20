import { assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";

Deno.test("StatisticsCapability, should return statistics", () => {
  const cache = Velo.builder().capacity(5).lru().stats().build();
  assertEquals(cache.stats.hitCount, 0);
  assertEquals(cache.stats.missCount, 0);
  assertEquals(cache.stats.hitRate, NaN);
});
