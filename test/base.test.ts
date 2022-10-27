import { BaseCache } from "../src/cache/base.ts";
import { assertFalse, assertThrows } from "./test_deps.ts";

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

Deno.test("BaseCache, should throw error for setWithExpire", () => {
  const cache = new BaseCache();
  assertThrows(() => cache.setWithExpire("key", "value", 1000));
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
  assertThrows(() => cache.take("key"));
  assertThrows(() => cache.peek("key"));
  assertThrows(() => cache.has("key"));
  assertThrows(() => cache.set("key", "value"));
  assertThrows(() => cache.remove("key"));
  assertThrows(() => cache.reset());
  assertThrows(() => cache.has("key"));
  assertThrows(() => cache.forEach(() => {}));
});

