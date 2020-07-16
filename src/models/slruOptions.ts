import { Options } from './options.ts';

export interface SLRUOptions extends Options {
  protectedCache: number;
  probationaryCache: number;
}
