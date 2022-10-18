import { Policy, Velo } from "../../mod.ts";
import { EventOptions } from "./capability/events/events.ts";
import { Key } from "./key.ts";

export interface CacheOptions<K, V> {
  capacity: number;
  policy: Policy<K, V> | null;
  events: boolean;
  eventOptions: EventOptions;
  ttl: number;
  stats: boolean;
}

export class Options<K extends Key, V> implements CacheOptions<K, V> {
  capacity: number;
  policy: Policy<K, V> | null;
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
      policy: null,
      events: false,
      eventOptions: {
        remove: true,
        set: false,
        get: false,
        clear: false,
      },
      ttl: 0,
      stats: false,
    };
  }

  toBuilder() {
    let builder = Velo.builder<K, V>().capacity(this.capacity);

    if (this.policy) {
      builder = builder.policy(this.policy);
    }

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
