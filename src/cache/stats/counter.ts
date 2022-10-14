import { StatCounter } from "../../models/stats.ts";

export class VeloCounter implements StatCounter {
  private _hits: number;
  private _misses: number;
  private _loadingSuccesses: number;
  private _loadingFailures: number;
  private _evictions: number;

  constructor() {
    this._hits = 0;
    this._misses = 0;
    this._loadingSuccesses = 0;
    this._loadingFailures = 0;
    this._evictions = 0;
  }

  recordHit() {
    this._hits++;
  }

  recordMiss() {
    this._misses++;
  }

  recordLoadingSuccess() {
    this._loadingSuccesses++;
  }

  recordLoadingFail() {
    this._loadingFailures++;
  }

  recordEviction() {
    this._evictions++;
  }

  stats() {
    return {
      hitCount: this._hits,
      missCount: this._misses,
      evictCount: this._evictions,
      loadingSuccessCount: this._loadingSuccesses,
      loadingFailureCount: this._loadingFailures,
      hitRate: this._hits / (this._hits + this._misses),
      missRate: this._misses / (this._hits + this._misses),
      loadFailureRate:
        this._loadingFailures /
        (this._loadingSuccesses + this._loadingFailures),
    };
  }
}
