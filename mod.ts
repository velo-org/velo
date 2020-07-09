import Cache from "./src/cache.ts";
const c = new Cache({ maxCache: 5 });
c.set("1", { hello: "asdf" });
c.set("2", { hello: "asdf" });
c.set("3", { hello: "asdf" });
c.set("4", { hello: "asdf" });
c.set("5", { hello: "asdf" });

console.log(c.get("1"));

c.set("6", { hello: "asdfdd" });
console.log(c.Storage);
