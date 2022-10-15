import { VeloCache, VeloLoadingCache } from "./velo.ts";
import { CacheOptions, Key, LoaderFunction } from "../models/cache.ts";
import { EventName, EventOptions } from "../models/events.ts";
import { ARC } from "../policy/arc.ts";
import { LRU } from "../policy/lru.ts";
import { SC } from "../policy/sc.ts";
import { Policy, updateCapacity } from "../models/policy.ts";
import { LFU } from "../policy/lfu.ts";
import { WindowTinyLfu } from "../policy/tiny_lfu/w_tiny_lfu.ts";
import { Options } from "./options.ts";

export class Velo<K extends Key, V> {
  private _options: CacheOptions<K, V> = Options.default<K, V>();
  private _is_unset_policy = true;

  private constructor() {}

  static builder<K1 extends Key, V1>() {
    return new Velo<K1, V1>();
  }

  static from<K1 extends Key, V1>(options: Options<K1, V1>) {
    return options.toBuilder();
  }

  public capacity(capacity: number) {
    this.requireExpr(capacity >= 0, "Capacity must be >= 0");
    this.requireExpr(this._options.capacity === 0, "Capacity already set");
    this._options.capacity = capacity;
    if (this._is_unset_policy) {
      this._options.policy = updateCapacity(this._options.policy, capacity);
    }
    return this;
  }

  public ttl(timeout: number) {
    this.requireExpr(timeout > 0, "TTL must be greater than 0");
    this.requireExpr(this._options.ttl === 0, "TTL already set");
    this._options.ttl = timeout;
    return this;
  }

  public stats() {
    this.requireExpr(!this._options.stats, "Stats already enabled");
    this._options.stats = true;
    return this;
  }

  public events(options?: EventOptions) {
    this.requireExpr(!this._options.events, "Events already enabled");
    this._options.events = true;
    if (options) {
      this._options.eventOptions = options;
    }
    return this;
  }

  public allEvents(option?: { loading: boolean }) {
    return this.events({
      remove: true,
      expire: true,
      set: true,
      get: true,
      clear: true,
      load: option?.loading ?? false,
      loaded: option?.loading ?? false,
    });
  }

  public setEvent(name: EventName, active?: boolean) {
    this.requireExpr(
      this._options.events,
      "Events are not enabled. Use events() before setEvent()"
    );
    this._options.eventOptions[name] = active ?? true;
    return this;
  }

  public policy(policy: Policy<K, V>) {
    this._options.policy = policy;
    this._is_unset_policy = false;
    return this;
  }

  public arc() {
    return this.policy(new ARC<K, V>(this._options.capacity));
  }

  public lru() {
    return this.policy(new LRU<K, V>(this._options.capacity));
  }

  public sc() {
    return this.policy(new SC<K, V>(this._options.capacity));
  }

  public lfu() {
    return this.policy(new LFU<K, V>(this._options.capacity));
  }

  public tinyLfu() {
    return this.policy(new WindowTinyLfu<K, V>(this._options.capacity));
  }

  public build(): VeloCache<K, V>;
  //prettier-ignore
  public build(loader: LoaderFunction<K, V>): VeloLoadingCache<K, V>;
  //prettier-ignore
  public build(loader?: LoaderFunction<K, V>): VeloCache<K, V> | VeloLoadingCache<K, V> {
    if (loader) {
      return new VeloLoadingCache<K, V>(
        this._options,
        loader
      );
    }

    this.requireExpr(this._options.eventOptions.load === false, "Load event requires a loading cache. Use .build(LoaderFunction)");
    this.requireExpr(this._options.eventOptions.loaded === false, "Loaded event requires a loading cache. Use .build(LoaderFunction)");

    return new VeloCache<K, V>(this._options);
  }

  private requireExpr(expression: boolean, message?: string) {
    if (!expression) {
      throw new Error(message);
    }
  }
}
