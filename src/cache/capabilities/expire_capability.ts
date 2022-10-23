import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { RemoveCause } from "./remove_listener_capability.ts";
import { OnExpire, TimerNode, TimerWheel } from "./timer_wheel.ts";
import { CapabilityWrapper } from "./wrapper.ts";

/**
 * Adds expiration of entries to a cache. Uses a {@link TimerWheel} to add,
 * manage, and remove expiration timers. Overwrites methods to advance the
 * timer wheel and passes the rest through to the inner cache.
 */
export class ExpireCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "expire";
  private ttl: number;
  private timerWheel: TimerWheel<K, V>;
  private scheduledNodes: Map<K, TimerNode<K, V>>;
  private onExpireFunction: OnExpire<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, ttl: number) {
    super(inner);
    this.ttl = ttl;
    this.scheduledNodes = new Map();
    this.onExpireFunction = (key, value) => {
      super.erase(key);
      if (this.onRemove) {
        this.onRemove(key, value, RemoveCause.Expired);
      }
      if (this.fireEvent) {
        this.fireEvent("expire", key, value);
      }
    };
    this.timerWheel = new TimerWheel<K, V>(this.onExpireFunction);
  }

  set(key: K, value: V): void {
    this.timerWheel.advance();
    this.setWithExpire(key, value, this.ttl);
  }

  setWithExpire(key: K, value: V, ttl: number) {
    const node = this.timerWheel.createAndSchedule(key, value, ttl);
    if (node) {
      this.scheduledNodes.set(key, node);
    }
    super.set(key, value);
  }

  get(key: K): V | undefined {
    this.timerWheel.advance();
    return super.get(key);
  }

  has(key: K): boolean {
    this.timerWheel.advance();
    return super.has(key);
  }

  peek(key: K): V | undefined {
    this.timerWheel.advance();
    return super.peek(key);
  }

  clear(): void {
    this.timerWheel = new TimerWheel<K, V>(this.onExpireFunction);
    this.scheduledNodes = new Map();
    return super.clear();
  }

  forEach(callback: (item: { key: K; value: V }, index?: number) => void): void {
    this.timerWheel.advance();
    return super.forEach(callback);
  }

  remove(key: K): void {
    const node = this.scheduledNodes.get(key);
    if (node) {
      this.timerWheel.deschedule(node);
    }
    this.timerWheel.advance();
    super.remove(key);
  }
}
