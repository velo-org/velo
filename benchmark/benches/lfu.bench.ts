import {
  lfu,
  DATA_1,
  DATA_2,
  MAX_KEYS,
  MISSING_KEY,
} from "../benchmark.config.ts";

Deno.bench({ name: "LFU set", group: "set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lfu.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "LFU get (hit)", group: "get (hit)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lfu.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "LFU get (miss)", group: "get (miss)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lfu.get(MISSING_KEY);
  }
});

Deno.bench({ name: "LFU update", group: "update" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lfu.set(DATA_1[i][0], DATA_2[i][1]);
  }
});

Deno.bench({ name: "LFU evict", group: "evict" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lfu.set(DATA_2[i][0], DATA_2[i][1]);
  }
});
