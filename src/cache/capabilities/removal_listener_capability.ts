import { Cache } from "../cache.ts";
import { Key } from "../key.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export enum RemovalCause {
  /**
   * The entry's expiration time has passed.
   */
  Expired,
  /**
   * The entry was explicitly removed by the user.
   */
  Explicit,
  /**
   * The entry's value was replaced by the user.
   */
  Replaced,
  /**
   * The entry was evicted by the cache policy to maintain the capacity.
   */
  Evicted,
}

export type RemovalListener<K, V> = (key: K, value: V, cause: RemovalCause) => void | Promise<void>;

export class RemovalListenerCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "removal_listener";
  private listener: RemovalListener<K, V>;

  constructor(inner: Cache<K, V>, listener: RemovalListener<K, V>) {
    super(inner);
    this.listener = listener;
  }

  set(key: K, value: V): void {
    const oldValue = this.peek(key);
    super.set(key, value);
    if (oldValue !== undefined) {
      this.listener(key, oldValue, RemovalCause.Replaced);
    }
  }

  remove(key: K): void {
    const value = this.peek(key);
    super.remove(key);
    this.listener(key, value!, RemovalCause.Explicit);
  }
}
