import { VeloCache } from "./velo.ts";
import { Key, LoaderFunction } from "../models/cache.ts";
import { EventOptions } from "../models/events.ts";
import { ARC } from "../policies/arc.ts";
import { LRU } from "../policies/lru.ts";
import { SC } from "../policies/sc.ts";
import { Policy } from "../models/policy.ts";
import { LFU } from "../policies/lfu.ts";
import { VeloLoadingCache } from "./loading.ts";
import { VeloOptions } from "./options.ts";

export class Velo<K extends Key, V> {
  _capacity = 0;
  _policy: Policy<K, V> | undefined = undefined;
  _events = false;
  _eventOptions = {
    clear: false,
    expired: true,
    get: false,
    removed: true,
    set: false,
  };
  _stats = false;
  _ttl = 0;

  private constructor() {}

  static builder<K1 extends Key, V1>() {
    return new Velo<K1, V1>();
  }

  public capacity(capacity: number) {
    this._capacity = capacity;
    return this;
  }

  public from(options: VeloOptions<K, V>) {
    return options.toBuilder();
  }

  public ttl(timeout: number) {
    this._ttl = timeout;
    return this;
  }

  public stats(active?: boolean) {
    this._stats = active || true;
    return this;
  }

  public events(options?: EventOptions) {
    this._events = true;
    if (options) {
      this._eventOptions = options;
    }
    return this;
  }

  public withPolicy(policy: Policy<K, V>) {
    this._policy = policy;
    return this;
  }

  public arc() {
    this._policy = new ARC(this._capacity);
    return this;
  }

  public lru() {
    this._policy = new LRU(this._capacity);
    return this;
  }

  public sc() {
    this._policy = new SC(this._capacity);
    return this;
  }

  public lfu() {
    this._policy = new LFU(this._capacity);
    return this;
  }

  public build(): VeloCache<K, V>;
  //prettier-ignore
  public build(loader: LoaderFunction<K, V>): VeloLoadingCache<K, V>;
  //prettier-ignore
  public build(loader?: LoaderFunction<K, V>): VeloCache<K, V> | VeloLoadingCache<K, V> {
    if (!this._policy) {
      this.lru();
    }

    if (loader) {
      return new VeloLoadingCache<K, V>(
        this,
        loader
      );
    }

    return new VeloCache<K, V>(
      this
    );
  }
}
