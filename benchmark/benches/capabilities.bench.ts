import {
  lru,
  DATA_1,
  MAX_KEYS,
  removeListenerCache,
  eventsCache,
  loadingCache,
  ttlCache,
} from "../benchmark.config.ts";

/**
 * Tests the performance impact of optional features.
 */

Deno.bench({ name: "Baseline operation: SET", group: "_set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "with LoadingCapability", group: "_set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    loadingCache.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "with EventsCapability", group: "_set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    eventsCache.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "with ExpireCapability", group: "_set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    ttlCache.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "with RemoveListenerCapability", group: "_set" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    removeListenerCache.set(DATA_1[i][0], DATA_1[i][1]);
  }
});

Deno.bench({ name: "Baseline operation: GET", group: "_get" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with LoadingCapability", group: "_get" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    loadingCache.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with EventsCapability", group: "_get" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    eventsCache.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with ExpireCapability", group: "_get" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    ttlCache.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with RemoveListenerCapability", group: "_get" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    removeListenerCache.get(DATA_1[i][0]);
  }
});

Deno.bench({ name: "Baseline operation: REMOVE", group: "_remove" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    lru.remove(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with LoadingCapability", group: "_remove" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    loadingCache.remove(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with EventsCapability", group: "_remove" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    eventsCache.remove(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with ExpireCapability", group: "_remove" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    ttlCache.remove(DATA_1[i][0]);
  }
});

Deno.bench({ name: "with RemoveListenerCapability", group: "_remove" }, () => {
  for (let i = 0; i < MAX_KEYS; i++) {
    removeListenerCache.remove(DATA_1[i][0]);
  }
});
