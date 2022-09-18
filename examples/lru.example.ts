import { LRU } from "../mod.ts";

/*
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)
 *
 * Discards the least recently used items first. This algorithm requires keeping
 * track of what was used when.
 */

interface Hello {
  hello: string;
}

const lruc = new LRU<string, Hello>({ capacity: 5 }); // init least recently used Cache with a max of 5 key-value pairs

lruc.on("remove", (key, value) => {
  console.log(key, value);
});
lruc.on("clear", () => {
  console.log("cache cleared");
});

lruc.on("set", (key, value) => {
  console.log(key, value);
});

lruc.on("expired", (key, value) => {
  console.log(key, value);
});

lruc.set(1, { hello: "asdf" }); //sets 1
lruc.set("2", { hello: "asdf" }); // sets 2
lruc.set("3", { hello: "asdf" }); // sets 3
lruc.set("4", { hello: "asdf" }); // sets 4
lruc.set("5", { hello: "asdf" }); // sets 5

lruc.get("2"); // gets 2 and pushes to the front

lruc.set("6", { hello: "asdfdd" }); // removes 1 sets 6
lruc.set("7", { hello: "asdfdd" }); // removes 3 sets 7
lruc.set(8, { hello: "asdfdd" }); // removes 4 sets 8
lruc.peek("5"); // returns value for key 5 without changing the queue
lruc.forEach((item, index) => console.log(item, index)); // Array like forEach
lruc.remove("5"); // remove key 5
lruc.clear(); // clear cache
