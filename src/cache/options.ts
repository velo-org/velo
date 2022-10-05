import { Key } from "../models/cache.ts";
import { EventOptions } from "../models/events.ts";
import { Policy } from "../models/policy.ts";
import { Velo } from "./builder.ts";

export class VeloOptions<K extends Key, V> {
  readonly capacity: number;
  readonly policy: Policy<K, V>;
  readonly events: boolean;
  readonly eventOptions: EventOptions;
  readonly ttl: number;
  readonly stats: boolean;

  constructor(
    capacity: number,
    policy: Policy<K, V>,
    events: boolean,
    eventOptions: EventOptions,
    ttl: number,
    stats: boolean
  ) {
    this.capacity = capacity;
    this.policy = policy;
    this.events = events;
    this.eventOptions = eventOptions;
    this.ttl = ttl;
    this.stats = stats;
  }

  toBuilder() {
    const builder = Velo.builder<Key, unknown>();
    builder._capacity = this.capacity;
    builder._policy = this.policy;
    builder._events = this.events;
    builder._eventOptions = this.eventOptions;
    builder._ttl = this.ttl;
    builder._stats = this.stats;
    return builder;
  }
}
