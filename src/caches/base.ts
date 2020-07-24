import { Options } from '../models/options.ts';

export abstract class BaseCache {
  readonly capacity: number;

  constructor(options: Options) {
    this.capacity = options.capacity;
  }
}
