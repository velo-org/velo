import { assertEquals } from "../../dev_deps.ts";
import { Velo } from "../../src/builder/builder.ts";
import { sleep } from "../../src/utils/sleep.ts";

Deno.test("ExpireCapability, should remove entry after timeout", async () => {
  const cache = Velo.builder().capacity(5).lru().ttl(200).build();
  cache.set("key", "value");
  await sleep(500);
  assertEquals(cache.size, 0);
});
