import { assertEquals, assertThrows } from "../dev_deps.ts";
import { Velo } from "../src/builder/builder.ts";

Deno.test("Builder, should reject non-positive capacity", () => {
  assertThrows(() => Velo.builder().capacity(-5));
});

Deno.test("Builder, should reject non-positive TTL", () => {
  assertThrows(() => Velo.builder().ttl(-5));
  assertThrows(() => Velo.builder().ttl(0));
});

Deno.test("Builder, should reject multiple calls to same method", () => {
  assertThrows(() => Velo.builder().capacity(5).capacity(10));
  assertThrows(() => Velo.builder().ttl(5).ttl(10));
  assertThrows(() => Velo.builder().stats().stats());
  assertThrows(() => Velo.builder().events().events());
});

Deno.test("Builder, should create a cache from Options object", () => {
  const cache_1 = Velo.builder().capacity(5).lru().build();
  const cache_2 = Velo.from(cache_1.options).build();
  assertEquals(cache_1.options, cache_2.options);
  assertEquals(cache_1.capacity, cache_2.capacity);
});
