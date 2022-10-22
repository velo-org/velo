import { Velo, RemoveCause } from "../mod.ts";
import { sleep } from "../test/utils/sleep.ts";

const cache = Velo.builder<string, number>()
  .capacity(5)
  .lru()
  .removalListener((key, value, cause) => {
    switch (cause) {
      case RemoveCause.Evicted:
        console.log(`Evicted: ${key}: ${value}`);
        break;
      case RemoveCause.Expired:
        console.log(`Expired: ${key}: ${value}`);
        break;
      case RemoveCause.Explicit:
        console.log(`Explicit: ${key}: ${value}`);
        break;
      case RemoveCause.Replaced:
        console.log(`Replaced: ${key}: ${value}`);
        break;
    }
  })
  .ttl(60_000)
  .build();

cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3);
cache.set("d", 4);
cache.set("e", 5);

cache.set("a", 100); // replaced

cache.set("f", 6); // evicted cache is full -> LRU: eviction of "b": 2

cache.remove("c"); // explicit

cache.setWithExpire("g", 7, 100); // expired
await sleep(200);
cache.clear(); // explicit
