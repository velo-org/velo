import { Velo } from "../src/cache/builder.ts";
import { DEFAULT } from "../src/cache/options.ts";
import { User } from "./common/User.ts";

/**
 * This example shows how to use cache events. Provide cache types with the
 * builder method.
 */

/**
 * Cache with default event settings ({@link VELO_EVENT_DEFAULTS})
 */
const _cache1 = Velo.builder<string, User>().capacity(10_000).events().build();

/**
 * Cache with custom event settings by providing an {@link EventOptions} object.
 * You can use `Options.default().eventOptions` and override the settings you want
 */
const _cache2 = Velo.builder<string, User>()
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
const _cache3 = Velo.builder<string, User>()
  .capacity(10_000)
  .events()
  .setEvent("get") // true
  .setEvent("clear", true)
  .setEvent("expire", false)
  .build();

/**
 * The default options are:
 * {
 *  remove: true,
 *  expire: false,
 *  set: false,
 *  get: false,
 *  clear: false,
 *  load: false,
 *  loaded: false,
 * }
 */
const cache = Velo.builder<string, User>()
  .capacity(10_000)
  .events()
  .setEvent("set")
  .setEvent("clear")
  .build();

// register listener
cache.events.on("remove", (key) => {
  console.log(`Removed: ${key}`);
});

// register listener
cache.events.on("set", (key, value) => {
  console.log(`Set: ${key}, ${value.getDisplayName()}`);
});

// register listener
cache.events.on("clear", () => {
  console.log(`Cleared`);
});

cache.set("1", new User("John Doe", "mail@example.com"));
cache.set("2", new User("Tracey Curtis", "mail@example.com"));
cache.remove("1");
cache.clear();
