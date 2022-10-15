import { Velo } from "../src/cache/builder.ts";
import { DEFAULT } from "../src/cache/options.ts";
import { User } from "./common/User.ts";

/**
 * This example shows how to use cache events. Provide cache types with the
 * builder method.
 */

/**
 * Cache with default event settings ({@link DEFAULT.eventOptions}):
 *
 *        DEFAULT.eventOptions === {
 *         remove: true,
 *         expire: true,
 *         set: false,
 *         get: false,
 *         clear: false,
 *         load: false,
 *         loaded: false,
 *        }
 */
const _cache1 = Velo.builder().capacity(10_000).events().build();

/**
 * Cache with custom event settings by providing an EventOptions object.
 * You can use the defaults and override specific properties.
 */
const _cache2 = Velo.builder()
  .capacity(10_000)
  .events({
    ...DEFAULT.eventOptions,
    set: true,
    get: true,
    clear: true,
  })
  .build();

/**
 * Additionally you can use setEvent() to enable or disable a specifc event
 */
const _cache3 = Velo.builder()
  .capacity(10_000)
  .events()
  .setEvent("get") // true
  .setEvent("clear", true)
  .setEvent("remove", false)
  .build();

/**
 * Set the cache types to enable type checking for event listeners
 */
const cache = Velo.builder<string, User>()
  .capacity(10_000)
  .events({ ...DEFAULT.eventOptions, set: true, clear: true })
  .build();

// register listener
cache.events.on("remove", (key) => {
  console.log(`(on remove) Removed: ${key}`);
});

// register listener
cache.events.on("set", (key, value) => {
  console.log(`(on set) Set: ${key}, ${value.getDisplayName()}`);
});

// register listener
cache.events.on("clear", () => {
  console.log(`(on clear) Cleared`);
});

cache.set("1", new User("John Doe", "mail@example.com"));
cache.set("2", new User("Tracey Curtis", "mail@example.com"));
cache.remove("1");
cache.clear();
