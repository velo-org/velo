import {
  sc,
  DATA_1,
  DATA_2,
  MAX_KEYS,
  MISSING_KEY,
} from "../benchmark.config.ts";

Deno.bench({ name: "SC set", group: "set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    sc.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "SC get (hit)", group: "get (hit)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    sc.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "SC get (miss)", group: "get (miss)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    sc.get(MISSING_KEY);
  }
});

Deno.bench({ name: "SC update", group: "update" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    sc.set(DATA_1[i][0], DATA_2[i][1]);
  }
});

Deno.bench({ name: "SC evict", group: "evict" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    sc.set(DATA_2[i][0], DATA_2[i][1]);
  }
});
