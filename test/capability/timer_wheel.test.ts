import { RemoveCause } from "../../src/cache/capabilities/remove_listener_capability.ts";
import { TimerWheel } from "../../src/cache/capabilities/timer_wheel.ts";
import { assert, assertEquals } from "../test_deps.ts";

Deno.test("TimerWheel, should create", () => {
  new TimerWheel<string, string>(() => {});
});

Deno.test("TimerWheel, should create and return node", () => {
  const wheel = new TimerWheel<string, string>(() => {});
  const node = wheel.createNode("key", "value", 100);
  assert(node !== null);
});

Deno.test("TimerWheel, should return null with negative or zero time", () => {
  const wheel = new TimerWheel<string, string>(() => {});
  const node1 = wheel.createNode("key", "value", -100);
  const node2 = wheel.createNode("key", "value", 0);
  assertEquals(node1, null);
  assertEquals(node2, null);
});

Deno.test("TimerWheel, should not expire 250ms advance 100ms", () => {
  // should not expire due to coarse granularity of time spans (smallest is seconds)
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 250);
  wheel.advance(100);
  assertEquals(expiredKeys.length, 0);
});

Deno.test("TimerWheel, should not expire 250ms advance 500ms", () => {
  // should not expire due to coarse granularity of time spans (smallest is seconds)
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 250);
  wheel.advance(500);
  assertEquals(expiredKeys.length, 0);
});

Deno.test("TimerWheel, should expire 250ms advance 1.07s", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 250);
  wheel.advance(1070);
  assertEquals(expiredKeys.length, 1);
  assertEquals(expiredKeys, ["key1"]);
});

Deno.test("TimerWheel, should not expire 2s advance 1.07s", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2_000);
  wheel.advance(1070);
  assertEquals(expiredKeys.length, 0);
});

Deno.test("TimerWheel, should expire 2s advance 4s", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2_000);
  wheel.advance(4_000);
  assertEquals(expiredKeys.length, 1);
  assertEquals(expiredKeys, ["key1"]);
});

Deno.test("TimerWheel, should not expire 2min advance 1min", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2 * 60 * 1_000);
  wheel.advance(60 * 1_000);
  assertEquals(expiredKeys.length, 0);
});

Deno.test("TimerWheel, should expire 2min advance 4min", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2 * 60 * 1_000);
  wheel.advance(4 * 60 * 1_000);
  assertEquals(expiredKeys.length, 1);
  assertEquals(expiredKeys, ["key1"]);
});

Deno.test("TimerWheel, should expire 2h advance 4h", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2 * 60 * 60 * 1_000);
  wheel.advance(4 * 60 * 60 * 1_000);
  assertEquals(expiredKeys.length, 1);
  assertEquals(expiredKeys, ["key1"]);
});

Deno.test("TimerWheel, should not expire 4x250ms advance 500ms", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 250);
  wheel.createAndSchedule("key2", "value1", 250);
  wheel.createAndSchedule("key3", "value1", 250);
  wheel.createAndSchedule("key4", "value1", 250);
  wheel.advance(500);
  assertEquals(expiredKeys.length, 0);
});

Deno.test("TimerWheel, should expire 4x250ms advance 1.07s", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 250);
  wheel.createAndSchedule("key2", "value1", 250);
  wheel.createAndSchedule("key3", "value1", 250);
  wheel.createAndSchedule("key4", "value1", 250);
  wheel.advance(1070);
  assertEquals(expiredKeys.length, 4);
  assertEquals(expiredKeys, ["key1", "key2", "key3", "key4"]);
});

Deno.test("TimerWheel, should expire 4x2s advance 4s", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2_000);
  wheel.createAndSchedule("key2", "value1", 2_000);
  wheel.createAndSchedule("key3", "value1", 2_000);
  wheel.createAndSchedule("key4", "value1", 2_000);
  wheel.advance(4_000);
  assertEquals(expiredKeys.length, 4);
  assertEquals(expiredKeys, ["key1", "key2", "key3", "key4"]);
});

Deno.test("TimerWheel, should expire 2min advance 1min then 3min", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 2 * 60 * 1_000);
  wheel.advance(1 * 60 * 1_000);
  assertEquals(expiredKeys.length, 0);
  wheel.advance(3 * 60 * 1_000);
  assertEquals(expiredKeys.length, 1);
});

Deno.test("TimerWheel, should expire 500ms advance 500ms then 500ms", () => {
  const expiredKeys: string[] = [];
  const wheel = new TimerWheel<string, string>((k) => {
    expiredKeys.push(k);
  });
  wheel.createAndSchedule("key1", "value1", 500);
  wheel.advance(500);
  assertEquals(expiredKeys.length, 0);
  wheel.advance(4000);

  assertEquals(expiredKeys.length, 1);
});
