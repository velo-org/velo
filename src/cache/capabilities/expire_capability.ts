import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { ExpireOptions } from "../options.ts";
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
  private ttlOptions: ExpireOptions;
  private timerWheel: TimerWheel<K, V>;
  private onExpireFunction: OnExpire<K, V>;

  // maps keys to nodes in activeNodes
  private nodeMap: Map<K, TimerNode<K, V>>;
  // node pool for object recycling
  private retiredNodes: TimerNode<K, V>[];

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, ttl: number, options: ExpireOptions) {
    super(inner);
    this.ttl = ttl;
    this.ttlOptions = options;
    this.retiredNodes = [];
    this.nodeMap = new Map();
    this.onExpireFunction = (node) => {
      super.erase(node.key!);
      this.nodeMap.delete(node.key!);
      if (this.onRemove) {
        this.onRemove(node.key!, node.value!, RemoveCause.Expired);
      }
      if (this.fireEvent) {
        this.fireEvent("expire", node.key, node.value);
      }
    };
    this.timerWheel = new TimerWheel<K, V>(this.onExpireFunction);
  }

  set(key: K, value: V): void {
    this.setWithExpire(key, value, this.ttl);
  }

  setWithExpire(key: K, value: V, ttl: number) {
    if (ttl <= 0) {
      throw Error(`Invalid TTL: ${ttl}`);
    }

    const node = this.nodeMap.get(key);
    if (node) {
      // refresh on write
      if (this.ttlOptions.refreshOnWrite) {
        this.timerWheel.scheduleWithTime(node, ttl);
      }
    } else {
      let newNode: TimerNode<K, V>;
      if (this.retiredNodes.length > 0) {
        newNode = this.retiredNodes.pop()!;
        newNode.key = key;
        newNode.value = value;
      } else {
        newNode = new TimerNode(0, key, value);
      }
      this.timerWheel.scheduleWithTime(newNode, ttl);
      this.nodeMap.set(key, newNode);
    }

    this.advanceTimerWheel();
    super.set(key, value);
  }

  get(key: K): V | undefined {
    this.advanceTimerWheel();
    const v = super.get(key);
    // refresh on read
    if (v && this.ttlOptions.refreshOnRead) {
      const node = this.nodeMap.get(key);
      if (node) {
        this.timerWheel.scheduleWithTime(node, this.ttl);
      }
    }
    return v;
  }

  has(key: K): boolean {
    this.advanceTimerWheel();
    return super.has(key);
  }

  peek(key: K): V | undefined {
    this.advanceTimerWheel();
    return super.peek(key);
  }

  reset(): void {
    this.timerWheel = new TimerWheel<K, V>(this.onExpireFunction);
    this.nodeMap = new Map();
    return super.reset();
  }

  forEach(callback: (item: { key: K; value: V }, index?: number) => void): void {
    this.advanceTimerWheel();
    return super.forEach(callback);
  }

  remove(key: K): void {
    const node = this.nodeMap.get(key);
    if (node) {
      this.nodeMap.delete(key);
      this.timerWheel.deschedule(node);
      this.retiredNodes.push(node);
    }
    this.advanceTimerWheel();
    super.remove(key);
  }

  private advanceTimerWheel() {
    // TODO: add a pacer to limit the frequency of this call
    this.timerWheel.advance();
  }
}
