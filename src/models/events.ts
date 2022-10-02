export interface EventOptions {
  set: boolean;
  get: boolean;
  removed: boolean;
  clear: boolean;
  expired: boolean;
}

export type KeyValueEventFunction<K, V> = (key: K, value: V) => void;
export type EmptyEventFunction = () => void;
export type EventFunction<K, V> =
  | KeyValueEventFunction<K, V>
  | EmptyEventFunction;

export type EventName = "set" | "get" | "removed" | "clear" | "expired";

export interface VeloEventEmitter<K, V> {
  on(name: EventName, lisener: EventFunction<K, V>): this;
}
