import { CacheOptions, Key } from "../models/cache.ts";
import { EventOptions } from "../models/events.ts";
import { Policy } from "../models/policy.ts";
import { LRU } from "../policy/lru.ts";
import { Velo } from "./builder.ts";

export class Options<K extends Key, V> implements CacheOptions<K, V> {
  capacity: number;
  policy: Policy<K, V>;
  events: boolean;
  eventOptions: EventOptions;
  ttl: number;
  stats: boolean;

  constructor();
  constructor(options: CacheOptions<K, V>);
  constructor(options?: CacheOptions<K, V>) {
    if (!options) {
      options = Options.default<K, V>();
    }
    this.capacity = options.capacity;
    this.policy = options.policy;
    this.events = options.events;
    this.eventOptions = options.eventOptions;
    this.ttl = options.ttl;
    this.stats = options.stats;
  }

  static default<K extends Key, V>(): CacheOptions<K, V> {
    return {
      capacity: 0,
      policy: new LRU<K, V>(0),
      events: false,
      eventOptions: {
        remove: true,
        expire: true,
        set: false,
        get: false,
        clear: false,
        load: false,
        loaded: false,
      },
      ttl: 0,
      stats: false,
    };
  }

  toBuilder() {
    let builder = Velo.builder<K, V>()
      .capacity(this.capacity)
      .policy(this.policy);

    if (this.events) {
      builder = builder.events(this.eventOptions);
    }

    if (this.ttl > 0) {
      builder = builder.ttl(this.ttl);
    }

    if (this.stats) {
      builder = builder.stats();
    }

    return builder;
  }
}

export const DEFAULT = Options.default();
