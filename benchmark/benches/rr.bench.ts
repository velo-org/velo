import { bench } from "../../dev_deps.ts";
import { DATA_1, DATA_2, EVICT, MAX_KEYS, RUNS } from "../benchmark.config.ts";
import { RR } from "../../src/caches/rr.ts";

const cache = new RR({ capacity: MAX_KEYS });

bench({
  name: `RR set x${MAX_KEYS}`,
  runs: RUNS,
  func(b): void {
    b.start();
    for (let i = 0; i < MAX_KEYS; i++) {
      cache.set(DATA_1[i][0], DATA_1[i][1]);
    }
    b.stop();
  },
});

bench({
  name: `RR get x${MAX_KEYS}`,
  runs: RUNS,
  func(b): void {
    b.start();
    for (let i = 0; i < MAX_KEYS; i++) {
      cache.get(DATA_1[i][0]);
    }
    b.stop();
  },
});

bench({
  name: `RR update x${MAX_KEYS}`,
  runs: RUNS,
  func(b): void {
    b.start();
    for (let i = 0; i < MAX_KEYS; i++) {
      cache.set(DATA_1[i][0], DATA_2[i][1]);
    }
    b.stop();
  },
});

bench({
  name: `RR evict x${MAX_KEYS}`,
  runs: RUNS,
  func(b): void {
    b.start();
    for (let i = MAX_KEYS; i < EVICT; i++) {
      cache.set(DATA_1[i][0], DATA_1[i][1]);
    }
    b.stop();
  },
});
