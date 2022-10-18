import { Velo } from "../../mod.ts";
/**
 * This example highlights the W-TinyLFU policy.
 *
 * See https://github.com/velo-org/velo/blob/master/src/policies/tiny_lfu/w_tiny_lfu.ts
 */

const tinyLfu = Velo.builder().capacity(100).tinyLfu().build();

/**
 * With a capacity of 100, the internal caches have a capacity of:
 * - 1 for the window cache
 * - 20 for the probationary segment of the main cache
 * - 79 for the protected segment of the main cache
 */

// we try to fill the cache
for (let i = 0; i < 100; i++) {
  tinyLfu.set(i, i);
}

// The size, however, is 21. This is because only the window and probationary caches are filled.
// Because the main cache is a SLRU, entries only enter the protected segment if they are accessed twice.
console.log(tinyLfu.size === 21);

// 99 is in the window cache, 98 is in the MRU position of the probationary segment
// by accesing it a second time, we promote it to the protected segment
tinyLfu.get(98);
// deno-lint-ignore no-explicit-any
console.log((tinyLfu as any)._policy.protected.keys());
