import { assertFalse, assertThrows } from "../dev_deps.ts";
import { BaseCache } from "../src/cache/base.ts";

Deno.test("BaseCache, should throw error on events getter", () => {
  const cache = new BaseCache();
  assertThrows(() => cache.events);
});

Deno.test("BaseCache, should throw error on stats getter", () => {
  const cache = new BaseCache();
  assertThrows(() => cache.stats);
});

Deno.test("BaseCache, should throw error on options getter", () => {
  const cache = new BaseCache();
  assertThrows(() => cache.options);
});

Deno.test("BaseCache, should not have refresh method", () => {
  const cache = new BaseCache();
  assertFalse(Reflect.has(cache, "refresh"));
});

Deno.test("BaseCache, should throw an error for methods that need a policy", () => {
  const cache = new BaseCache();
  assertThrows(() => cache.capacity);
  assertThrows(() => cache.values);
  assertThrows(() => cache.keys);
  assertThrows(() => cache.size);
  assertThrows(() => cache.get("key"));
  assertThrows(() => cache.peek("key"));
  assertThrows(() => cache.has("key"));
  assertThrows(() => cache.set("key", "value"));
  assertThrows(() => cache.remove("key"));
  assertThrows(() => cache.clear());
  assertThrows(() => cache.has("key"));
  assertThrows(() => cache.forEach(() => {}));
});
