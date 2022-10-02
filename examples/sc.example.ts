import { Velo } from "../mod.ts";
import { Hello } from "./common/Hello.ts";

// init Second Chance Cache with max 5 key-value pairs
const scc = Velo.capacity(5).sc().build<string, Hello>();

scc.events.on("removed", (key, value) => {
  console.log(key, value);
});
scc.events.on("clear", () => {
  console.log("cache cleared");
});

scc.events.on("set", (key, value) => {
  console.log(key, value);
});
scc.events.on("expired", (key, value) => {
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
