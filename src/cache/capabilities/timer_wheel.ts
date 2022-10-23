import { Key } from "../key.ts";
import { nextPowerOfTwo } from "../../utils/next_power_of_two.ts";
import { countTrailingZeros } from "../../utils/count_trailing_zeros.ts";

const BUCKETS = [64, 64, 32, 4, 1];

const SPANS = [
  nextPowerOfTwo(1_000), // 1.07s
  nextPowerOfTwo(60 * 1_000), // 1.14m
  nextPowerOfTwo(60 * 60 * 1_000), // 1.22h
  nextPowerOfTwo(24 * 60 * 60 * 1_000), // 1.63d
  BUCKETS[3] * nextPowerOfTwo(24 * 60 * 60 * 1_000), // 6.5d
  BUCKETS[3] * nextPowerOfTwo(24 * 60 * 60 * 1_000), // 6.5d
];

const SHIFT = [
  countTrailingZeros(SPANS[0]),
  countTrailingZeros(SPANS[1]),
  countTrailingZeros(SPANS[2]),
  countTrailingZeros(SPANS[3]),
  countTrailingZeros(SPANS[4]),
];

export type OnExpire<K, V> = (key: K, val: V) => void;

/**
 * Implementation of a timer wheel [1] to manage expiration of cache entries.
 * Eviction events are stored in a hierarchical circular structure of buckets.
 * Each bucket represents a rough time span (seconds, minutes, etc.). Based on
 * Caffeine's implementation [2].
 *
 * - [1] http://www.cs.columbia.edu/~nahum/w6998/papers/ton97-timing-wheels.pdf
 * - [2] https://github.com/ben-manes/caffeine/blob/master/caffeine/src/main/java/com/github/benmanes/caffeine/cache/TimerWheel.java
 */
export class TimerWheel<K extends Key, V> {
  private base: number; // removed from all timers
  private time: number;
  private onExpire: OnExpire<K, V>; // called when keys have expired

  private wheel: TimerNode<K, V>[][];

  constructor(onExpire: OnExpire<K, V>) {
    this.base = Date.now();
    this.time = 0;
    this.onExpire = onExpire;
    this.wheel = BUCKETS.map((b) => {
      const list = new Array(b);
      for (let i = 0; i < b; i++) {
        list[i] = new SentinelNode<K, V>();
      }
      return list;
    });
  }

  public createAndSchedule(key: K, value: V, time: number) {
    const node = this.createNode(key, value, time);
    if (node) {
      this.schedule(node);
    }
    return node;
  }

  public createNode(key: K, value: V, time: number) {
    if (time <= 0) {
      return null;
    }
    return new TimerNode(time + this.time, key, value);
  }

  /**
   * Schedules a TimerNode to be evicted, adding it to the correct bucket.
   */
  public schedule(node: TimerNode<K, V>) {
    node.remove();
    const sentinel = this.findBucket(node.time);
    node.appendToTail(sentinel);
  }

  /**
   * Removes a timer event from the wheel if present.
   */
  public deschedule(node: TimerNode<K, V>) {
    node.remove();
  }

  public advance(currentTimeMs?: number) {
    const previousTime = this.time;
    const currentTime = currentTimeMs || this.applyBase(Date.now());
    this.time = currentTime;

    for (let i = 0; i < SHIFT.length; i++) {
      const previousTicks = previousTime >>> SHIFT[i];
      const currentTicks = currentTime >>> SHIFT[i];
      const delta = currentTicks - previousTicks;
      if (delta <= 0) {
        break;
      }
      this.expire(i, previousTicks, delta);
    }
  }

  private expire(index: number, previousTicks: number, delta: number) {
    const timerWheel = this.wheel[index];
    const mask = timerWheel.length - 1;

    const steps = Math.min(1 + delta, timerWheel.length);
    const start = previousTicks & mask;
    const end = start + steps;

    const expiredKeys = new Array<K>();
    for (let i = start; i < end; i++) {
      const sentinel = timerWheel[i & mask];
      let node = sentinel.next;

      sentinel.next = sentinel;
      sentinel.prev = sentinel;

      while (node !== sentinel) {
        const next = node.next;
        node.remove();

        if (node.time <= this.time && node.key) {
          // node expired
          expiredKeys.push(node.key);
          this.onExpire(node.key, node.value!);
        } else {
          // node did not expire, but time passed -> reschedule
          this.schedule(node);
        }

        node = next;
      }
    }
  }

  private findBucket(time: number) {
    const duration = time - this.time;
    const length = this.wheel.length - 1;

    for (let i = 0; i < length; i++) {
      if (duration < SPANS[i + 1]) {
        const ticks = time >>> SHIFT[i];
        const index = ticks & (this.wheel[i].length - 1);
        return this.wheel[i][index];
      }
    }

    return this.wheel[length][0];
  }

  private applyBase(time: number) {
    return time - this.base;
  }
}

export class TimerNode<K extends Key, V> {
  next: TimerNode<K, V>;
  prev: TimerNode<K, V>;
  key: K | undefined;
  value: V | undefined;
  time: number;

  constructor(time: number, key?: K, value?: V) {
    this.time = time;
    this.key = key;
    this.value = value;
    this.next = this;
    this.prev = this;
  }

  public remove() {
    this.prev.next = this.next;
    this.next.prev = this.prev;
    this.next = this;
    this.prev = this;
  }

  public appendToTail(head: this) {
    const tail = head.prev;
    head.prev = this;
    tail.next = this;
    this.next = head;
    this.prev = tail;
  }
}

class SentinelNode<K extends Key, V> extends TimerNode<K, V> {
  constructor() {
    super(Number.MAX_SAFE_INTEGER, undefined, undefined);
  }
}
