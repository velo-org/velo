import { CacheBuilder } from "./builder.ts";

export class Velo {
  private constructor() {}

  public static capacity(capacity: number) {
    return new CacheBuilder(capacity);
  }
}
