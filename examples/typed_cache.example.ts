import { Velo } from "../mod.ts";
import { User } from "./common/User.ts";

/**
 * This example shows a typed cache.
 * - K is the key type and must be a string or number
 * - V is the generic value type
 */

const cache = Velo.builder<string, User>().capacity(10_000).build();

cache.set("27b2be78-a75f-4032-920c-eeb4ce00f58a", new User("John Doe", "john.doe@example.com"));

cache.set("7ba860e0-5de0-4801-8ff7-956cd5c556e3", new User("Tara Chambers", "tara.chambers@example.com"));

cache.set("b6630ac3-0e20-49e2-87c5-9277f096dc7f", new User("Tracey Curtis", "tracey.curtis@example.com"));

cache.forEach((entry) => {
  console.log(entry.value.getDisplayName());
});
