import { Velo } from "../src/cache/cache.ts";
import { sleep } from "../src/utils/sleep.ts";
import { assertEquals } from "../dev_deps.ts";

Deno.test("Cache, should fire expired event", async () => {
  const cache = Velo.capacity(5).events(true).ttl(200).build();
  cache.set("key", "value");

  cache.events.on("expired", (key, _) => {
    assertEquals(key, "key");
  });

  await sleep(500);
});

Deno.test("Cache, should fire clear event", () => {
  const cache = Velo.capacity(5).events(true).build();
  cache.set("key", "value");

  cache.events.on("clear", () => {
    assertEquals(cache.size, 0);
  });
});

Deno.test("Cache, should fire set event", () => {
  const cache = Velo.capacity(5).events(true).build();

  cache.events.on("set", (key, value) => {
    assertEquals(key, "key");
    assertEquals(value, "value");
  });

  cache.set("key", "value");
});

Deno.test("Cache, should fire remove event", () => {
  const cache = Velo.capacity(5).events(true).build();
  cache.set("key", "value");

  cache.events.on("removed", (key, _) => {
    assertEquals(key, "key");
  });

  cache.remove("key");
});
