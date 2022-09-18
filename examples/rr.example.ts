import { RR } from "../mod.ts";

/**
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Random_replacement_(RR)
 *
 * Randomly selects a candidate item and discards it to make space when necessary.
 */

interface Hello {
  hello: string;
}

const rrc = new RR<string, Hello>({ capacity: 5 }); // init Random Replacement Cache with max 5 key-value pairs
rrc.on("remove", (key, value) => {
  console.log(key, value);
});
rrc.on("clear", () => {
  console.log("cache cleared");
});

rrc.on("set", (key, value) => {
  console.log(key, value);
});

rrc.on("expired", (key, value) => {
  console.log(key, value);
});

rrc.set("1", { hello: "asdf" }); // sets 1
rrc.set("2", { hello: "asdf" }); // sets 2
rrc.set("3", { hello: "asdf" }); // sets 3
rrc.set("4", { hello: "asdf" }); // sets 4
rrc.set("5", { hello: "asdf" }); // sets 5

rrc.set("6", { hello: "asdfdd" }); // sets 6 removes random entry
rrc.get("6"); // returns value for key 6
rrc.peek("4"); // returns value for key 4 without changing the queue
rrc.forEach((item, index) => console.log(item, index)); // Array like forEach
rrc.remove("4"); // remove key 4
rrc.clear(); // clear cache
