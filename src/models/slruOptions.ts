import { Options } from "./options.ts";

export interface SLRUOptions extends Omit<Options, "capacity"> {
  protectedCache: number;
  probationaryCache: number;
}
