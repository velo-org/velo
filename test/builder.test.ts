import { assert, assertEquals, assertThrows } from "./test_deps.ts";
import { DEFAULT, Options } from "../mod.ts";
import { Velo } from "../src/builder/builder.ts";
import { LoadingCapability } from "../src/cache/capabilities/loading_capability.ts";

Deno.test("Builder, should provide expected API", () => {
  // static
  assert(Reflect.has(Velo, "builder"));
  assert(Reflect.has(Velo, "from"));
  const builder = Velo.builder();
  assert(Reflect.has(builder, "capacity"));
  assert(Reflect.has(builder, "events"));
  assert(Reflect.has(builder, "withEvent"));
  assert(Reflect.has(builder, "allEvents"));
  assert(Reflect.has(builder, "ttl"));
  assert(Reflect.has(builder, "stats"));
  assert(Reflect.has(builder, "removalListener"));
  assert(Reflect.has(builder, "policy"));
  assert(Reflect.has(builder, "arc"));
  assert(Reflect.has(builder, "lru"));
  assert(Reflect.has(builder, "lfu"));
  assert(Reflect.has(builder, "tinyLfu"));
  assert(Reflect.has(builder, "sc"));
  assert(Reflect.has(builder, "build"));
});

Deno.test("Builder, should apply options wrapper by default", () => {
  const cache = Velo.builder().build();
  assertEquals(cache.options, new Options());
});

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

Deno.test("Builder, should set correct event options", () => {
  let cache = Velo.builder()
    .events({ ...DEFAULT.eventOptions, set: true, get: true })
    .build();
  assertEquals(cache.options.eventOptions, {
    remove: true,
    expire: true,
    set: true,
    get: true,
    clear: false,
  });
  cache = Velo.builder().allEvents().build();
  assertEquals(cache.options.eventOptions, {
    remove: true,
    expire: true,
    set: true,
    get: true,
    clear: true,
  });
});

Deno.test("Builder, should create a cache from Options object", () => {
  const cache_1 = Velo.builder().capacity(5).lru().build();
  const cache_2 = Velo.from(cache_1.options).build();
  assertEquals(cache_1.options, cache_2.options);
  assertEquals(cache_1.capacity, cache_2.capacity);
});

Deno.test("Builder, should create a loading cache instance", () => {
  const cache = Velo.builder<string, string>()
    .capacity(5)
    .lru()
    .build((k: string) => {
      return k + "1";
    });

  assert(cache instanceof LoadingCapability);
  assert(Reflect.has(cache, "refresh"));
});
