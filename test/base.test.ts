import { assertEquals } from "../dev_deps.ts";
import { BaseCache } from "../src/caches/base.ts";
import { Options } from "../src/models/options.ts";
import { sleep } from "../src/utils/sleep.ts";

class TestCache extends BaseCache<string, string> {
  private map: Map<string, string>;

  constructor(params: Options) {
    super(params);
    this.map = new Map();
  }

  get size(): number {
    return this.map.size;
  }

  remove(key: string): void {
    this.map.delete(key);
    this.fireRemoveEvent(key, "");
  }
  get(key: string): string | undefined {
    return this.map.get(key);
  }
  set(key: string, value: string): void {
    this.map.set(key, value);
    this.fireSetEvent(key, value);
  }
  peek(key: string): string | undefined {
    return this.get(key);
  }
  has(key: string): boolean {
    return this.map.has(key);
  }
  clear(): void {
    this.map.clear();
    this.fireClearEvent();
  }
  forEach(
    callback: (item: { key: string; value: string }, index: number) => void
  ): void {
    this.map.forEach((val, key) => callback({ key: key, value: val }, 0));
  }
}

Deno.test("BaseCache, should fire expired event", async () => {
  const cache = new TestCache({ capacity: 5, events: true });
  cache.set("key", "value");
  cache.setTTL("key", 200);

  cache.on("expired", (key, _) => {
    assertEquals(key, "key");
  });

  await sleep(500);
});

Deno.test("BaseCache, should fire clear event", () => {
  const cache = new TestCache({ capacity: 5, events: true });
  cache.set("key", "value");

  cache.on("clear", () => {
    assertEquals(cache.size, 0);
  });
});

Deno.test("BaseCache, should fire set event", () => {
  const cache = new TestCache({ capacity: 5, events: true });

  cache.on("set", (key, _) => {
    assertEquals(key, "key");
  });

  cache.set("key", "value");
});

Deno.test("BaseCache, should fire remove event", () => {
  const cache = new TestCache({ capacity: 5, events: true });
  cache.set("key", "value");

  cache.on("remove", (key, _) => {
    assertEquals(key, "key");
  });

  cache.remove("key");
});
