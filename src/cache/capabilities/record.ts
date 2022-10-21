import { Key } from "../key.ts";
import { CapabilityWrapper } from "./wrapper.ts";

export class CapabilityRecord<K extends Key, V> extends Map<string, CapabilityWrapper<K, V>> {
  initAll() {
    this.forEach((capability) => capability.initCapability(this));
  }
}
