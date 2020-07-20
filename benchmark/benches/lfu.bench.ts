import { bench } from '../../deps.ts';
import { RUNS, MAX_KEYS, EVICT, DATA_1, DATA_2 } from '../benchmark.config.ts';
import { LFU } from '../../src/caches/lfu.ts';

const cache = new LFU({ capacity: MAX_KEYS });

bench({
  name: `LFU set x${MAX_KEYS}`,
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
  name: `LFU get x${MAX_KEYS}`,
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
  name: `LFU update x${MAX_KEYS}`,
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
  name: `LFU evict x${MAX_KEYS}`,
  runs: RUNS,
  func(b): void {
    b.start();
    for (let i = MAX_KEYS; i < EVICT; i++) {
      cache.set(DATA_1[i][0], DATA_1[i][1]);
    }
    b.stop();
  },
});
