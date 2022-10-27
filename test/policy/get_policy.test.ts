// deno-lint-ignore no-explicit-any
export function getPolicy(cache: any) {
  let inner = cache;
  do {
    if (Reflect.has(inner, "policy")) {
      return inner.policy;
    }
    inner = cache.inner;
  } while (inner);
}
