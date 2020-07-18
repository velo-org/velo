import { Options } from '../models/options.ts';

export abstract class BaseCache {
  protected maxCache?: number;

  constructor(options: Options = { maxCache: 0 }) {
    this.maxCache = options.maxCache;
  }

  get MaxCache() {
    return this.maxCache;
  }
}
