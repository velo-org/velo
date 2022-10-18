import { EventEmitter } from "../../../../deps.ts";
import { Cache } from "../../cache.ts";
import { Key } from "../../key.ts";
import { CapabilityWrapper } from "../wrapper.ts";
import { EventName, EventOptions, VeloEventEmitter } from "./events.ts";

export const EVENT_ID = "events";

export class EventCapability<K extends Key, V> extends CapabilityWrapper<K, V> {
  private eventoptions: EventOptions;
  private eventEmitter: EventEmitter;

  constructor(inner: Cache<K, V>, options: EventOptions) {
    super(EVENT_ID, inner);
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

  private fireEvent(name: EventName, ...args: (K | V | undefined)[]) {
    if (this.eventoptions[name]) {
      this.eventEmitter.emit(name, ...args);
    }
  }
}
