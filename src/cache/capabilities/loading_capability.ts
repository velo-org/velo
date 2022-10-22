import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export type LoaderFunction<K, V> = (key: K) => V;

export interface LoadingCache<K extends Key, V> extends Omit<Cache<K, V>, "get"> {
  get(key: K): V;
  refresh(key: K): void;
}

/**
 * Adds loading functionality to a cache. The loader function is called when a
 * cache miss occurs in {@link get}. Then the generated value is stored in the
 * cache with {@link set} and returned. The {@link refresh} method can be used
 * to refresh the value of a key, via the loader function.
 */
export class LoadingCapability<K extends Key, V> extends CapabilityWrapper<K, V> implements LoadingCache<K, V> {
  static ID = "loading";
  private loader: LoaderFunction<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, loader: LoaderFunction<K, V>) {
    super(inner);
    this.loader = (key) => {
      try {
        return loader(key);
      } catch (e) {
        throw e;
      }
    };
  }

  get(key: K): V {
    let value = super.get(key);
    if (value === undefined) {
      value = this.loader(key);
      this.set(key, value);
    }
    return value;
  }

  /**
   * Runs the loader function for a given key and sets the generated value
   */
  refresh(key: K) {
    const value = this.loader(key);
    this.set(key, value);
  }
}
