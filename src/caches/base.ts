import { Options } from '../models/options.ts';

export abstract class BaseCache {
  protected readonly capacity: number;

  constructor(options: Options) {
    this.capacity = options.capacity;
  }

  get Capacity() {
    return this.capacity;
  }
}
