export interface EventOptions {
  remove: boolean;
  expire: boolean;
  set: boolean;
  get: boolean;
  clear: boolean;
  load: boolean;
  loaded: boolean;
}

export type EventName =
  | "set"
  | "remove"
  | "clear"
  | "expire"
  | "get"
  | "load"
  | "loaded";

type KeyEventFunction<K> = (key: K) => void;
type KeyValueEventFunction<K, V> = (key: K, value: V) => void;
type EmptyEventFunction = () => void;

export interface VeloEventEmitter<K, V> {
  on(name: "remove", listener: KeyEventFunction<K>): this;
  on(name: "expire", listener: KeyEventFunction<K>): this;
  on(name: "set", listener: KeyValueEventFunction<K, V>): this;
  on(name: "get", listener: KeyValueEventFunction<K, V | undefined>): this;
  on(name: "clear", listener: EmptyEventFunction): this;
  on(name: "load", listener: KeyEventFunction<K>): this;
  on(name: "loaded", listener: KeyValueEventFunction<K, V>): this;
}
