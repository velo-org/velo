import { ARC } from "../mod.ts";
import { Person } from "./common/Person.ts";

/*
 * https://en.wikipedia.org/wiki/Adaptive_replacement_cache
 *
 * Adaptive Replacement Cache (ARC) is a page replacement algorithm with better
 * performance than LRU (least recently used). This is accomplished by keeping
 * track of both frequently used and recently used pages plus a recent eviction
 * history for both.
 */

const arc = new ARC<Person>({ capacity: 5 });

arc.set(1, { name: "Leon", age: 35 });
arc.set(2, { name: "Daniel", age: 40 });
arc.set(3, { name: "John", age: 20 });
arc.set(4, { name: "Nadia", age: 30 });
arc.set(5, { name: "Helen", age: 25 });

// at this point the cache is full and all entries are in the recent_set list (t1)

arc.get(4); // moves they key to the frequently_set list (t2)

arc.set(5, { name: "Helen", age: 26 }); // also moves this key to t2

arc.set(6, { name: "Tracy", age: 45 }); // inserted into recent_set (t1), pushes last entry of t1 (key: 1) into recent_evicted (b1)

// at this point the cache is still full with keys 2,3,6 in t1 and 4,5 in t2
// also the ghost list b1 has the recently evicted key 1

arc.set(1, { name: "Leon", age: 36 }); // removes this key from b1 and inserts it in t2

// the cache has 2 keys in recent set t1 (keys: 3,6) and 3 in frequently set t2 (keys: 4,5,1)
