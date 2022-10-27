import { Velo } from "../../mod.ts";
/**
 * This example highlights the Adaptive Replacement Cache (ARC) policy.
 *
 * See https://github.com/velo-org/velo/blob/master/src/policies/arc.ts
 */

const arc = Velo.builder().capacity(5).arc().build();

arc.set(1, "1");
arc.set(2, "2");
arc.set(3, "3");
arc.set(4, "4");
arc.set(5, "5");

// at this point the cache is full and all entries are in the recent_set list (t1)

arc.get(4); // moves they key to the frequently_set list (t2)

arc.set(5, "5"); // also moves this key to t2

arc.set(6, "6"); // inserted into recent_set (t1), pushes last entry of t1 (key: 1) into recent_evicted (b1)

// at this point the cache is still full with keys 2,3,6 in t1 and 4,5 in t2
// also the ghost list b1 has the recently evicted key 1

arc.set(1, "1"); // removes this key from b1 and inserts it in t2

// the cache has 2 keys in recent set t1 (keys: 3,6) and 3 in frequently set t2 (keys: 4,5,1)

arc.peek(4); // returns value for key 4 without changing the queue
arc.forEach((item, index) => console.log(item, index)); // Array like forEach
arc.remove(4); // remove key 4
arc.reset(); // clear cache
