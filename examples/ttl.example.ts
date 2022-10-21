import { Velo } from "../mod.ts";
import { sleep } from "../test/utils/sleep.ts";

/**
 * This example highlights the timeout functionality. The ttl() method, you can
 * set a time (in ms) after which an entry is removed from the cache.
 */
(async () => {
  const cache = Velo.builder().capacity(10_000).events().ttl(500).build();

  cache.set("key", "value");

  await sleep(1000);

  console.log(cache.size === 0); // true

  // set specific timeout for a key
  cache.setWithExpire("key", "value", 100);

  await sleep(300);

  console.log(cache.size === 0); // true
})();
