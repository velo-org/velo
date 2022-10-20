import { arc, DATA_1, DATA_2, MAX_KEYS, MISSING_KEY } from "../benchmark.config.ts";

Deno.bench({ name: "ARC set", group: "set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    arc.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "ARC get (hit)", group: "get (hit)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    arc.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "ARC get (miss)", group: "get (miss)" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    arc.get(MISSING_KEY);
  }
});

Deno.bench({ name: "ARC update", group: "update" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    arc.set(DATA_1[i][0], DATA_2[i][1]);
  }
});

Deno.bench({ name: "ARC evict", group: "evict" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    arc.set(DATA_2[i][0], DATA_2[i][1]);
  }
});
