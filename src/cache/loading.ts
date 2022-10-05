import { Key, LoaderFunction } from "../models/cache.ts";
import { Velo } from "./builder.ts";
import { VeloCache } from "./velo.ts";

export class VeloLoadingCache<K extends Key, V> extends VeloCache<K, V> {
  private _loaderFunction: LoaderFunction<K, V>;
  constructor(builder: Velo<K, V>, loader: LoaderFunction<K, V>) {
    super(builder);
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
