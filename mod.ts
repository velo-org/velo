import { Policy as VeloPolicy } from "./src/models/policy.ts";

export { Velo } from "./src/cache/cache.ts";

export type Policy<K, V> = VeloPolicy<V, K>;
