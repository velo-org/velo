import { Velo } from "../mod.ts";
import { sleep } from "../src/utils/sleep.ts";

/**
 * This example highlights the timeout functionality. The ttl() method, we can
 * set a time (in ms) after which an entry is removed from the cache.
 */
(async () => {
  const cache = Velo.builder().capacity(10_000).events().ttl(500).build();

  cache.events.on("expire", (key) => {
    console.log(`Expired: ${key}`);
  });

  cache.set("key", "value");

  await sleep(1000);

  console.log(cache.size === 0); // true
})();
