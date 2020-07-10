import { Options } from '../models/options.ts';

export class BaseCache<T> {
  options: Options;
  storage: T[];

  constructor(options: Options = { maxCache: 0 }) {
    this.options = options;
    this.storage = [];
  }

  get Storage() {
    return this.storage;
  }
}
