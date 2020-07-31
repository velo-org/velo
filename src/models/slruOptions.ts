export interface SLRUOptions {
  protectedCache: number;
  probationaryCache: number;
  stdTTL?: number;
  setEvent?: boolean;
  clearEvent?: boolean;
  expiredEvent?: boolean;
  removeEvent?: boolean;
}
