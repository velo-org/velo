const MAX_KEYS = 100_000;
const EVICT = 2 * MAX_KEYS;
const RUNS = 10;

const DATA_1 = new Array<[string, number]>(EVICT);
const DATA_2 = new Array<[string, number]>(EVICT);

for (let i = 0; i < EVICT; i++) {
  DATA_1[i] = [i.toString(), Math.floor(Math.random() * 1e7)];
  DATA_2[i] = [i.toString(), Math.floor(Math.random() * 1e7)];
}

const CACHES = ["ARC", "LFU", "LRU", "RR", "SC", "SLRU"];

const MARKDOWN_OUT = "./benchmark/README.md";

const MARKDOWN_GROUPS = CACHES.map((c) => {
  return {
    include: new RegExp(`^${c}`),
    name: c,
    description:
      `https://github.com/velo-org/velo/blob/master/src/caches/${c.toLowerCase()}.ts`,
  };
});

export {
  CACHES,
  DATA_1,
  DATA_2,
  EVICT,
  MARKDOWN_GROUPS,
  MARKDOWN_OUT,
  MAX_KEYS,
  RUNS,
};
