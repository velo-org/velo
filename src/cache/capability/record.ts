import { Key } from "../key.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export interface CapabilityRecord<K extends Key, V> {
  capabilityMap: Map<string, CapabilityWrapper<K, V>>;

  getCapability(id: string): CapabilityWrapper<K, V>;
}
