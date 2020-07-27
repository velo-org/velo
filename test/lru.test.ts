import { LRU } from '../src/caches/lru.ts';
import { assert, assertEquals } from '../deps.ts';

Deno.test('LRU create cache, should create a new empty cache', () => {
  const lruCache = new LRU({ capacity: 5 });
  assertEquals(lruCache.size, 0);
});

Deno.test('LRU get existing entry, should return the value', () => {
  const lruCache = new LRU({ capacity: 5 });
  lruCache.set('key', true);
  assert(lruCache.get('key'));
});

Deno.test(
  'LRU get (non-existent) entry from empty cache, should return undefined',
  () => {
    const lruCache = new LRU({ capacity: 5 });
    assertEquals(lruCache.get('key'), undefined);
  }
);

Deno.test('LRU get non-existent entry, should return undefined', () => {
  const lruCache = new LRU({ capacity: 5 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  assertEquals(lruCache.get('key'), undefined);
});
Deno.test('LRU remove entry, should return undefined', () => {
  const lruCache = new LRU({ capacity: 5 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  lruCache.remove('3');
  assertEquals(lruCache.get('3'), undefined);
});

Deno.test(
  'LRU set one more than allowed capacity, should not increase amount of keys',
  () => {
    const lruCache = new LRU({ capacity: 5 });
    lruCache.set('1', 1);
    lruCache.set('2', 2);
    lruCache.set('3', 3);
    lruCache.set('4', 4);
    lruCache.set('5', 5);
    lruCache.set('6', 6);
    assertEquals(lruCache.size, 5);
  }
);

Deno.test(
  'LRU set one more than allowed capacity, should evict first inserted key',
  () => {
    const lruCache = new LRU({ capacity: 5 });
    lruCache.set('1', 1);
    lruCache.set('2', 2);
    lruCache.set('3', 3);
    lruCache.set('4', 4);
    lruCache.set('5', 5);
    lruCache.set('6', 6);
    assert(!lruCache.has('1'));
  }
);

Deno.test('LRU clear should reset cache', () => {
  const lruCache = new LRU({ capacity: 5 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  lruCache.set('5', 5);
  lruCache.clear();
  assertEquals(lruCache.peek('3'), undefined);
  assertEquals(lruCache.size, 0);
});
