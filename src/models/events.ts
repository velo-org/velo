export interface EventOptions {
  set: boolean;
  removed: boolean;
  clear: boolean;
  expired: boolean;
}

export type EventName = "set" | "removed" | "clear" | "expired";
export type KeyValueEventFunction<K, V> = (key: K, value: V) => void;
export type EmptyEventFunction = () => void;
export type EventFunction<K, V> =
  | KeyValueEventFunction<K, V>
  | EmptyEventFunction;

export interface VeloEventEmitter<K, V> {
  on(name: EventName, listener: EventFunction<K, V>): this;
}
