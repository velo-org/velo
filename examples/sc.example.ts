import { SC } from "../mod.ts";

/*
 * https://www.geeksforgeeks.org/second-chance-or-clock-page-replacement-policy/
 *
 * In the Second Chance page replacement policy, the candidate pages for
 * removal are considered in a round robin matter, and a page that has been
 * accessed between consecutive considerations will not be replaced. The page
 * replaced is the one that, when considered in a round robin matter, has not
 * been accessed since its last consideration.
 */

interface Hello {
  hello: string;
}

const scc = new SC<Hello>({ capacity: 5 }); // init Second Chance Cache with max 5 key-value pairs
scc.on("remove", (key, value) => {
  console.log(key, value);
});
scc.on("clear", () => {
  console.log("cache cleared");
});

scc.on("set", (key, value) => {
  console.log(key, value);
});
scc.on("expired", (key, value) => {
  console.log(key, value);
});

scc.set("1", { hello: "asdf" }); // sets 1
scc.set("2", { hello: "asdf" }); // sets 2
scc.set("3", { hello: "asdf" }); // sets 3
scc.set("4", { hello: "asdf" }); // sets 4
scc.set("5", { hello: "asdf" }); // sets 5

scc.get("1"); // gets 1 second Chance gets activated

scc.set("6", { hello: "asdfdd" }); // sets 6 removes 2
scc.set("7", { hello: "asdfdd" }); // sets 7 remove 1
scc.peek("4"); // returns value for key 4 without changing the queue
scc.forEach((item, index) => console.log(item, index)); // Array like forEach
scc.remove("4"); // remove key 4
scc.clear(); // clear cache
