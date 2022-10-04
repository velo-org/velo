import { Velo } from "../src/cache/builder.ts";
import { sleep } from "../src/utils/sleep.ts";
import { assertEquals } from "../dev_deps.ts";
import string_decoder from "https://deno.land/std@0.155.0/node/internal_binding/string_decoder.ts";
import { VeloLoadingCache } from "../src/cache/loading.ts";
import {
  assert,
  assertThrows,
} from "https://deno.land/std@0.155.0/testing/asserts.ts";

Deno.test("Cache, should fire expired event", async () => {
  const cache = Velo.builder().capacity(5).events(true).ttl(200).build();
  cache.set("key", "value");

  cache.events.on("expired", (key, _) => {
    assertEquals(key, "key");
  });

  await sleep(500);
});

Deno.test("Cache, should fire clear event", () => {
  const cache = Velo.builder().capacity(5).events(true).build();
  cache.set("key", "value");

  cache.events.on("clear", () => {
    assertEquals(cache.size, 0);
  });
});

Deno.test("Cache, should fire set event", () => {
  const cache = Velo.builder().capacity(5).events(true).build();

  cache.events.on("set", (key, value) => {
    assertEquals(key, "key");
    assertEquals(value, "value");
  });

  cache.set("key", "value");
});

Deno.test("Cache, should fire remove event", () => {
  const cache = Velo.builder().capacity(5).events(true).build();
  cache.set("key", "value");

  cache.events.on("removed", (key, _) => {
    assertEquals(key, "key");
  });

  cache.remove("key");
});
Deno.test("Cache, should be a loading Cache", () => {
  const cache = Velo.builder()
    .capacity(5)
    .build((k: string) => {
      return k + "1";
    });

  assert(cache instanceof VeloLoadingCache);
});

Deno.test("Cache, should load value if not present", () => {
  const cache = Velo.builder()
    .capacity(5)
    .build<number, number>((k) => {
      return k + 1;
    });

  cache.get(1);

  assertEquals(cache.get(1), 2);
});
Deno.test("Cache, should refresh value", () => {
  const cache = Velo.builder()
    .capacity(5)
    .build<number, number>((k) => {
      return k + 1;
    });
  cache.get(1);
  cache.refresh(1);

  assertEquals(cache.get(1), 2);
});
Deno.test("Cache, should throw error", () => {
  const cache = Velo.builder()
    .capacity(5)
    .build<number, number>((k) => {
      if (k === 0) {
        throw new Deno.errors.InvalidData("No Null");
      }
      return k + 1;
    });

  assertThrows(() => cache.get(0), Deno.errors.InvalidData);
});
