import { Velo } from "../mod.ts";
import { Options } from "../src/cache/options.ts";

export const MAX_KEYS = 500_000;
export const EVICT = 2 * MAX_KEYS;
export const MISSING_KEY = "MISSING KEY";

export const DATA_1 = new Array<[string, number]>(EVICT);
export const DATA_2 = new Array<[string, number]>(EVICT);

for (let i = 0; i < EVICT; i++) {
  DATA_1[i] = [i.toString(), Math.floor(Math.random() * 1e7)];
  DATA_2[i] = [i.toString(), Math.floor(Math.random() * 1e7)];
}

const options = new Options<string, number>();
options.capacity = MAX_KEYS;

export const arc = Velo.from(options).arc().build();
export const lfu = Velo.from(options).lfu().build();
export const lru = Velo.from(options).lru().build();
export const sc = Velo.from(options).sc().build();
export const tinyLfu = Velo.from(options).tinyLfu().build();
