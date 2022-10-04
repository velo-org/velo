import { VeloCache } from "./base.ts";
import { CacheOptions, Key, LoaderFunction } from "../models/cache.ts";
import { EventName } from "../models/events.ts";
import { ARC } from "../policies/arc.ts";
import { LRU } from "../policies/lru.ts";
import { SC } from "../policies/sc.ts";
import { Policy } from "../models/policy.ts";
import { LFU } from "../policies/lfu.ts";
import { kArrayBufferOffset } from "https://deno.land/std@0.155.0/node/internal_binding/stream_wrap.ts";
import { VeloLoadingCache } from "./loading.ts";

export class Velo {
  protected _options: CacheOptions = {
    capacity: 0,
    policy: undefined,
    enableEvents: false,
    events: {
      clear: false,
      expired: true,
      get: false,
      removed: true,
      set: false,
    },
    stats: false,
    ttl: 0,
  };

  private constructor() {}

  static builder() {
    return new Velo();
  }

  public capacity(capacity: number) {
    this._options.capacity = capacity;
    return this;
  }

  public from(options: CacheOptions) {
    this._options = options;
    return this;
  }

  public ttl(timeout: number) {
    this._options.ttl = timeout;
    return this;
  }

  public stats(active?: boolean) {
    this._options.stats = active || true;
    return this;
  }

  public events(active?: boolean) {
    this._options.enableEvents = active || true;
    return this;
  }

  public enableEvent(...name: EventName[]) {
    this.events();
    name.forEach((n) => (this._options.events[n] = true));
    return this;
  }

  public disableEvent(...name: EventName[]) {
    name.forEach((n) => (this._options.events[n] = false));
    return this;
  }

  public withPolicy<K, V>(policy: Policy<V, K>): Velo {
    this._options.policy = policy;
    return this;
  }

  public arc(): Velo {
    this._options.policy = new ARC(this._options.capacity);
    return this;
  }

  public lru(): Velo {
    this._options.policy = new LRU(this._options.capacity);
    return this;
  }

  public sc(): Velo {
    this._options.policy = new SC(this._options.capacity);
    return this;
  }

  public lfu(): Velo {
    this._options.policy = new LFU(this._options.capacity);
    return this;
  }
  public build<K extends Key, V>(): VeloCache<K, V>;
  public build<K extends Key, V>(
    loader: LoaderFunction<K, V>
  ): VeloLoadingCache<K, V>;
  public build<K extends Key, V>(
    loader?: LoaderFunction<K, V>
  ): VeloCache<K, V> | VeloLoadingCache<K, V> {
    if (!this._options.policy) {
      this.lru();
    }
    if (loader) {
      return new VeloLoadingCache<K, V>(
        this._options.policy as Policy<V, K>,
        this._options,
        loader
      );
    }

    return new VeloCache<K, V>(
      this._options.policy as Policy<V, K>,
      this._options
    );
  }
}
