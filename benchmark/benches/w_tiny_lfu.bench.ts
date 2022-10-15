import {
  tinyLfu,
  DATA_1,
  DATA_2,
  MAX_KEYS,
  MISSING_KEY,
} from "../benchmark.config.ts";

Deno.bench({ name: "W-TinyLFU set", group: "set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    tinyLfu.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "W-TinyLFU get (hit)", group: "get (hit)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    tinyLfu.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "W-TinyLFU get (miss)", group: "get (miss)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    tinyLfu.get(MISSING_KEY);
  }
});

Deno.bench({ name: "W-TinyLFU update", group: "update" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    tinyLfu.set(DATA_1[i][0], DATA_2[i][1]);
  }
});

Deno.bench({ name: "W-TinyLFU evict", group: "evict" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    tinyLfu.set(DATA_2[i][0], DATA_2[i][1]);
  }
});
