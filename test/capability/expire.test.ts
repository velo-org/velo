import { assert, assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { BaseCache } from "../../src/cache/base.ts";
import { Cache, CacheInternal } from "../../src/cache/cache.ts";
import { ExpireCapability } from "../../src/cache/capabilities/expire_capability.ts";
import { sleep } from "../utils/sleep.ts";

Deno.test("ExpireCapability, should wrap cache", () => {
  let cache: Cache<string, string> & CacheInternal<string, string> = new BaseCache<string, string>();
  cache = new ExpireCapability(cache, 500);
  assertEquals(cache instanceof ExpireCapability, true);
  assert((cache as any).ttl !== undefined);
});

Deno.test("ExpireCapability, should remove entry after timeout", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  cache.set("key", "value");
  await sleep(500);
  assertEquals(cache.size, 0);
});
