import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export type LoaderFunction<K, V> = (key: K) => V;

export interface LoadingCache<K extends Key, V> extends Omit<Cache<K, V>, "get"> {
  get(key: K): V;
  refresh(key: K): void;
}

export class LoadingCapability<K extends Key, V> extends CapabilityWrapper<K, V> implements LoadingCache<K, V> {
  static ID = "loading";
  private loader: LoaderFunction<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, loader: LoaderFunction<K, V>) {
    super(inner);
    this.loader = (k) => {
      try {
        return loader(k);
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
   * Runs the loader function for a given key and sets the value
   */
  refresh(key: K) {
    const value = this.loader(key);
    this.set(key, value);
  }
}