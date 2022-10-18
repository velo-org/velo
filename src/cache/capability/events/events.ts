export interface EventOptions {
  remove: boolean;
  set: boolean;
  get: boolean;
  clear: boolean;
}

export type EventName = "set" | "remove" | "clear" | "get";

type KeyEventFunction<K> = (key: K) => void;
type KeyValueEventFunction<K, V> = (key: K, value: V) => void;
type EmptyEventFunction = () => void;

export interface VeloEventEmitter<K, V> {
  on(name: "remove", listener: KeyEventFunction<K>): this;
  on(name: "set", listener: KeyValueEventFunction<K, V>): this;
  on(name: "get", listener: KeyValueEventFunction<K, V | undefined>): this;
  on(name: "clear", listener: EmptyEventFunction): this;
}
