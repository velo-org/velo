import { Key, LoaderFunction, VeloOptions } from "../models/cache.ts";
import { Policy } from "../models/policy.ts";
import { VeloCache } from "./velo.ts";

export class VeloLoadingCache<K extends Key, V> extends VeloCache<K, V> {
  private _loaderFunction: LoaderFunction<K, V>;
  constructor(
    policy: Policy<V, K>,
    options: VeloOptions,
    loader: LoaderFunction<K, V>,
  ) {
    super(policy, options);
    this._loaderFunction = (k) => {
      try {
        return loader(k);
      } catch (e) {
        throw e;
      }
    };
  }

  get(key: K): V | undefined {
    let value = this._policy.get(key);
    if (!value) {
      value = this._loaderFunction(key);
      this.set(key, value!);
      return value;
    }
    return value;
  }

  refresh(key: K) {
    const value = this._loaderFunction(key);
    this.set(key, value!);
  }
}
