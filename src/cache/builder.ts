import { VeloCache, VeloLoadingCache } from "./velo.ts";
import { Key, LoaderFunction } from "../models/cache.ts";
import { EventName, EventOptions } from "../models/events.ts";
import { ARC } from "../policies/arc.ts";
import { LRU } from "../policies/lru.ts";
import { SC } from "../policies/sc.ts";
import { Policy } from "../models/policy.ts";
import { LFU } from "../policies/lfu.ts";
import { VeloOptions } from "./options.ts";
import { WindowTinyLfu } from "../policies/tiny_lfu/w_tiny_lfu.ts";

export class Velo<K extends Key, V> {
  _capacity = 0;
  _policy?: Policy<K, V>;
  _events = false;
  _eventOptions = {
    expired: true,
    removed: true,
    set: false,
    clear: false,
  };
  _stats = false;
  _ttl = 0;

  private constructor() {}

  static builder<K1 extends Key, V1>() {
    return new Velo<K1, V1>();
  }

  public capacity(capacity: number) {
    this.requireExpr(capacity > 0, "Capacity must be greater than 0");
    this.requireExpr(this._capacity === 0, "Capacity already set");
    this._capacity = capacity;
    return this;
  }

  public from(options: VeloOptions<K, V>) {
    return options.toBuilder();
  }

  public ttl(timeout: number) {
    this.requireExpr(timeout > 0, "TTL must be greater than 0");
    this.requireExpr(this._ttl === 0, "TTL already set");
    this._ttl = timeout;
    return this;
  }

  public stats() {
    this.requireExpr(!this._stats, "Stats already enabled");
    this._stats = true;
    return this;
  }

  public events(options?: EventOptions) {
    this.requireExpr(!this._events, "Events already enabled");
    this._events = true;
    if (options) {
      this._eventOptions = options;
    }
    return this;
  }

  public setEvent(name: EventName, active?: boolean) {
    this._eventOptions[name] = active ?? true;
    return this;
  }

  public withPolicy(policy: Policy<K, V>) {
    this.requireExpr(this._policy === undefined, "Policy is already set");
    this.requireExpr(
      this._capacity > 0,
      "Provide capacity before policy and build"
    );
    this._policy = policy;
    return this;
  }

  public arc() {
    return this.withPolicy(new ARC<K, V>(this._capacity));
  }

  public lru() {
    return this.withPolicy(new LRU<K, V>(this._capacity));
  }

  public sc() {
    return this.withPolicy(new SC<K, V>(this._capacity));
  }

  public lfu() {
    return this.withPolicy(new LFU<K, V>(this._capacity));
  }

  public tinyLfu() {
    return this.withPolicy(new WindowTinyLfu<K, V>(this._capacity));
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

  private requireExpr(expression: boolean, message?: string) {
    if (!expression) {
      throw new Error(message);
    }
  }
}
