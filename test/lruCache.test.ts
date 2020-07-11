import { LRUCache } from '../src/caches/lruCache.ts';
import { assert, assertEquals } from '../deps.ts';

Deno.test('LRU create cache, should create a new empty cache', () => {
  const lruCache = new LRUCache({ maxCache: 5 });
  assertEquals(lruCache.Storage.length, 0);
});

Deno.test('LRU get existing entry, should return the value', () => {
  const lruCache = new LRUCache({ maxCache: 5 });
  lruCache.set('key', true);
  assert(lruCache.get('key'));
});

Deno.test(
  'LRU get (non-existent) entry from empty cache, should return undefined',
  () => {
    const lruCache = new LRUCache({ maxCache: 5 });
    assertEquals(lruCache.get('key'), undefined);
  }
);

Deno.test('LRU get non-existent entry, should return undefined', () => {
  const lruCache = new LRUCache({ maxCache: 5 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  assertEquals(lruCache.get('key'), undefined);
});

Deno.test(
  'LRU set more than specified key, should not increase amount of keys',
  () => {
    const lruCache = new LRUCache({ maxCache: 5 });
    lruCache.set('1', 1);
    lruCache.set('2', 2);
    lruCache.set('3', 3);
    lruCache.set('4', 4);
    lruCache.set('5', 5);
    lruCache.set('6', 6);
    assertEquals(lruCache.Storage.length, 5);
  }
);
