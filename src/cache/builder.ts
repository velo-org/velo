import { CacheOptions, Key } from "../models/cache.ts";
import { EventName } from "../models/events.ts";
import { ARC } from "../policies/arc.ts";
import { LRU } from "../policies/lru.ts";
import { VeloCache } from "./base.ts";

enum Policy {
  ARC,
  LRU,
}

export class CacheBuilder {
  protected _capacity: number;
  protected _options: CacheOptions = {
    enableEvents: false,
    events: {
      clear: true,
      expired: true,
      get: true,
      removed: true,
      set: true,
    },
    stats: false,
    ttl: 0,
  };

  constructor(capacity?: number) {
    this._capacity = capacity || 0;
  }

  public capacity(capacity: number) {
    this._capacity = capacity;
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

  public enableEvent(name: EventName, active?: boolean) {
    this._options.events[name] = active || true;
    return this;
  }

  public withPolicy(policy: Policy): CacheBuilder {
    switch (policy) {
      case Policy.ARC:
        return this.arc();
      case Policy.LRU:
        return this.lru();
    }
  }

  public arc() {
    return new ArcBuilder();
  }

  public lru() {
    return new LruBuilder();
  }

  public build<K extends Key, V>() {
    return this.lru().build<K, V>();
  }
}

class ArcBuilder extends CacheBuilder {
  public build<K extends Key, V>() {
    return new VeloCache<K, V>(new ARC(this._capacity), this._options);
  }
}

class LruBuilder extends CacheBuilder {
  public build<K extends Key, V>() {
    return new VeloCache<K, V>(new LRU(this._capacity), this._options);
  }
}
