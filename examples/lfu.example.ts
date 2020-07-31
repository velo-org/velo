import { LFU } from "../mod.ts";

/**
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Least-frequently_used_(LFU)
 *
 * Counts how often an item is needed. Those that are used least often are discarded first.
 */

interface Hello {
  hello: string;
}

const lfuc = new LFU<Hello>({ capacity: 5 }); // inits a Least frequently used Cache with a max of 5 key-value pairs

lfuc.set(1, { hello: "asdf" }); //sets 1
lfuc.set("2", { hello: "asdf" }); // sets 2
lfuc.set("3", { hello: "asdf" }); // sets 3
lfuc.set("4", { hello: "asdf" }); // sets 4
lfuc.set("5", { hello: "asdf" }); // sets 5

lfuc.get("2"); // gets 2 and increment frequency

lfuc.set("6", { hello: "asdfdd" }); // removes 1 sets 6
lfuc.set("7", { hello: "asdfdd" }); // removes 3 sets 7
lfuc.set(8, { hello: "asdfdd" }); // removes 4 sets 8
