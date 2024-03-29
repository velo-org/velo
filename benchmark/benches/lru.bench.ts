import { lru, DATA_1, DATA_2, MAX_KEYS, MISSING_KEY } from "../benchmark.config.ts";

Deno.bench({ name: "LRU set", group: "set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "LRU get (hit)", group: "get (hit)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "LRU get (miss)", group: "get (miss)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.get(MISSING_KEY);
  }
});

Deno.bench({ name: "LRU update", group: "update" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.set(DATA_1[i][0], DATA_2[i][1]);
  }
});

Deno.bench({ name: "LRU evict", group: "evict" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.set(DATA_2[i][0], DATA_2[i][1]);
  }
});
