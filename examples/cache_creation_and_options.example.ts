import { Options, LRU, Velo } from "../mod.ts";
import { User } from "./common/user.ts";

/**
 * This example shows different methods of initializing a cache.
 */

const options = new Options<string, User>();
options.capacity = 10_000;
options.events = true;
options.eventOptions = {
  remove: true,
  expire: true,
  set: true,
  get: true,
  clear: true,
};
options.policy = new LRU(options.capacity);
options.stats = true;
options.ttl = 5 * 60 * 1000; // 5 minutes

/**
 * Cache created from an options object
 */
const _cache_1 = options.toBuilder().build();

/**
 * Cache created with the static `from` builder methid given an options object
 */
const _cache_2 = Velo.from(options).build();

/**
 * Cache created using the builder, with the same properties as the two above
 */
const _cache_3 = Velo.builder<string, User>()
  .capacity(10_000)
  .allEvents()
  .lru()
  .stats()
  .ttl(5 * 60 * 1000) // 5 minutes
  .build();

/**
 * Options can be extracted from an existing cache and used to create a new cache
 */
const options_2 = _cache_3.options;
const _cache_3_clone = Velo.from(options_2).build();

/**
 * Caches with default settings {@link DEFAULT}.
 */
const _cache_4 = Velo.builder<string, User>().build();
const _cache_5 = Velo.from(new Options<string, User>()).build();
