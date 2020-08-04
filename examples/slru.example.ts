import { SLRU } from "../mod.ts";

/*
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Segmented_LRU_(SLRU)
 *
 * SLRU cache is divided into two segments, a probationary segment and a
 * protected segment. Lines in each segment are ordered from the most to the
 * least recently accessed. Data from misses is added to the cache at the most
 * recently accessed end of the probationary segment. Hits are removed from
 * wherever they currently reside and added to the most recently accessed end of
 * the protected segment.
 */

interface Hello {
  hello: string;
}

// inits a Segmented Least Recently Used Cache with max 5 key-value pairs
const slruc = new SLRU<Hello>({
  protectedCache: 5,
  probationaryCache: 5,
});

slruc.on("remove", (key, value) => {
  console.log(key, value);
});
slruc.on("clear", () => {
  console.log("cache cleared");
});

slruc.on("set", (key, value) => {
  console.log(key, value);
});
slruc.on("expired", (key, value) => {
  console.log(key, value);
});

slruc.set("1", { hello: "asdf" }); // sets 1
slruc.set("2", { hello: "asdf" }); // sets 2
slruc.set("3", { hello: "asdf" }); // sets 3
slruc.set("4", { hello: "asdf" }); // sets 4
slruc.set("5", { hello: "asdf" }); // sets 5

slruc.get("1"); // returns value for key 1 adds 1 to the protected segment

slruc.set("6", { hello: "asdfdd" }); // sets 6
slruc.set("7", { hello: "asdfdd" }); // sets 6 removes 2
slruc.peek("4"); // returns value for key 4 without changing the queue
slruc.forEach((item, index) => console.log(item, index)); // Array like forEach
slruc.remove("4"); // remove key 4
slruc.clear(); // clear cache
