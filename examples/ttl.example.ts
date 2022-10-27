import { Velo } from "../mod.ts";
import { sleep } from "../test/utils/sleep.ts";

/**
 * This example highlights the timeout functionality. The ttl() method, you can
 * set a time (in ms) after which an entry is removed from the cache.
 */
(async () => {
  const cache = Velo.builder().capacity(10_000).lru().ttl(500).build();

  cache.set("key", "value");

  await sleep(1500);
  cache.get("");

  console.log(cache.size === 0); // true

  // set specific timeout for a key
  cache.setWithExpire("key", "value", 1000);

  await sleep(2000);
  cache.get("");

  console.log(cache.size === 0); // true

  // refresh the timeout when a key is read
  const cache_2 = Velo.builder().capacity(10_000).lru().ttl(800, { refreshOnRead: true }).build();
  cache_2.set("key", "value");
  await sleep(500);
  cache_2.get("key"); // refreshes the timeout
  await sleep(500);
  console.log(cache_2.size === 1); // true, "key" still in cache, because its TTL was refreshed
})();
