export interface EventOptions {
  set: boolean;
  get: boolean;
  removed: boolean;
  clear: boolean;
  expired: boolean;
}

export type KeyValueEventFunction<V, K> = (key: K, value: V) => void;
export type EmptyEventFunction = () => void;
export type EventFunction<V, K> =
  | KeyValueEventFunction<V, K>
  | EmptyEventFunction;

export type EventName = "set" | "get" | "removed" | "clear" | "expired";
