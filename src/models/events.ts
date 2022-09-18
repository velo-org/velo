export type KeyValueEventFunction<V, K> = (key: K, value: V) => void;
export type EmptyEventFunction = () => void;
export type EventFunction<V, K> =
  | KeyValueEventFunction<V, K>
  | EmptyEventFunction;
