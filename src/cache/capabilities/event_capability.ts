import { EventEmitter } from "../../../deps.ts";
import { Cache } from "../cache.ts";
import { Key } from "../key.ts";
import { EventOptions } from "../options.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export type EventName = "set" | "remove" | "clear" | "get" | "expire";

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
  private eventoptions: EventOptions;
  private eventEmitter: EventEmitter;

  constructor(inner: Cache<K, V>, options: EventOptions) {
    super(inner);
    this.eventoptions = options;
    this.eventEmitter = new EventEmitter();
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

  fireEvent(name: EventName, ...args: (K | V | undefined)[]) {
    if (this.eventoptions[name]) {
      this.eventEmitter.emit(name, ...args);
    }
  }
}
