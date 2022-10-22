import { EventEmitter } from "../../../deps.ts";
import { Cache, CacheInternal } from "../cache.ts";
import { Key } from "../key.ts";
import { EventOptions } from "../options.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export type EventName = "set" | "remove" | "clear" | "get" | "expire";

export type FireEventFunction<K, V> = (name: EventName, ...args: (K | V | undefined)[]) => void;
type KeyEventFunction<K> = (key: K) => void;
type KeyValueEventFunction<K, V> = (key: K, value: V) => void;
type EmptyEventFunction = () => void;

export interface VeloEventEmitter<K, V> {
  on(name: "remove", listener: KeyEventFunction<K>): this;
  on(name: "expire", listener: KeyValueEventFunction<K, V>): this;
  on(name: "set", listener: KeyValueEventFunction<K, V>): this;
  on(name: "get", listener: KeyValueEventFunction<K, V | undefined>): this;
  on(name: "clear", listener: EmptyEventFunction): this;
}

export class EventCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  static ID = "event";
  private eventOptions: EventOptions;
  private eventEmitter: EventEmitter;
  fireEvent: FireEventFunction<K, V>;

  constructor(inner: Cache<K, V> & CacheInternal<K, V>, options: EventOptions) {
    super(inner);
    this.eventOptions = options;
    this.eventEmitter = new EventEmitter();
    this.fireEvent = (name: EventName, ...args: (K | V | undefined)[]) => {
      if (this.eventOptions[name]) {
        this.eventEmitter.emit(name, ...args);
      }
    };
  }

  set(key: K, value: V) {
    super.set(key, value);
    this.fireEvent("set", key, value);
  }

  get(key: K) {
    const value = super.get(key);
    this.fireEvent("get", key, value);
    return value;
  }

  remove(key: K) {
    super.remove(key);
    this.fireEvent("remove", key);
  }

  clear() {
    super.clear();
    this.fireEvent("clear");
  }

  get events(): VeloEventEmitter<K, V> {
    return this.eventEmitter;
  }
}
