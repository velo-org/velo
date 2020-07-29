import { LRU } from '../src/caches/lru.ts';
import { assert, assertEquals } from '../deps.ts';
import { sleep } from '../src/utils/sleep.ts';

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

Deno.test('LRU get removed entry, should return undefined', () => {
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

Deno.test('LRU set double the allowed capacity, should evict all keys', () => {
  const lruCache = new LRU({ capacity: 3 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  lruCache.set('5', 5);
  lruCache.set('6', 6);

  assertEquals(lruCache.keys, ['4', '5', '6']);
});

Deno.test('LRU forEach should print out the right key value pairs', () => {
  const lruCache = new LRU({ capacity: 5 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  lruCache.set('5', 5);
  lruCache.remove('5');
  const testKeys: any[] = [];
  lruCache.forEach((i, index) => {
    testKeys.push(i.key);
  });
  console.log(testKeys);
  assertEquals(testKeys.length, 4);
});

Deno.test('LRU use with ttl', async () => {
  const lruCache = new LRU({ capacity: 5, stdTTL: 500 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  lruCache.set('5', 5);
  await sleep(600);
  assertEquals(lruCache.size, 0);
  assertEquals(lruCache.keys, []);
});

Deno.test('LRU use with ttl, oveLRUide ttl for specific set', async () => {
  const lruCache = new LRU({ capacity: 5, stdTTL: 500 });
  lruCache.set('1', 1);
  lruCache.set('2', 2);
  lruCache.set('3', 3);
  lruCache.set('4', 4);
  lruCache.set('5', 5, 1000);
  await sleep(600);
  assertEquals(lruCache.size, 1);
  assertEquals(lruCache.keys, ['5']);
  await sleep(400);
});
