export type Key = number | string;

export type LoaderFunction<K, V> = (key: K) => V;
