import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { CapabilityWrapper } from "./wrapper.ts";

/**
 * The reason why a cache entry was removed.
 */
export enum RemoveCause {
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
   * The entry was evicted by the cache policy to maintain capacity.
   */
  Evicted,
}

export type RemoveListener<K, V> = (key: K, value: V, cause: RemoveCause) => void | Promise<void>;

/**
 * Extend cache functionality to notify a listener when an entry is removed.
 */
export class RemoveListenerCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "removal_listener";
  private listener: RemoveListener<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, listener: RemoveListener<K, V>) {
    super(inner);
    this.listener = listener;
    super.onRemove = (key, value, cause) => this.listener(key, value, cause);
  }
}
