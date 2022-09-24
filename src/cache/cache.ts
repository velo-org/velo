import { CacheBuilder } from "./builder.ts";

export class Velo {
  private constructor() {}

  public static cache(capacity: number) {
    return new CacheBuilder(capacity);
  }
}
