import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { CacheOptions, Options } from "../options.ts";
import { CapabilityWrapper } from "./wrapper.ts";

/**
 * Allows the options to be extracted from a cache. The {@link options} getter
 * returns an immutable object.
 */
export class ExtractOptionsCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "extract_options";
  private cacheOptions: CacheOptions<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, options: CacheOptions<K, V>) {
    super(inner);
    this.cacheOptions = options;
  }

  get options(): Options<K, V> {
    return Object.freeze(new Options(this.cacheOptions));
  }
}
