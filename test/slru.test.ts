import { SLRU } from '../src/caches/slru.ts';
import { assertEquals } from '../deps.ts';
import { sleep } from '../src/utils/sleep.ts';

Deno.test('SLRU create Cache, should create a new empty cache', () => {
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  assertEquals(slruCache.size, 0);
});
Deno.test('SLRU create entry, and retrieve it', () => {
  const entry = { hello: 'asdf' };
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  slruCache.set(1, entry);
  assertEquals(slruCache.get(1), entry);
});
Deno.test(
  'SLRU get (non-existent) entry from empty cache, should return undefined',
  () => {
    const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
    assertEquals(slruCache.get('key'), undefined);
  }
);

Deno.test('SLRU get non-existent entry, should return undefined', () => {
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.set('4', 4);
  assertEquals(slruCache.get('key'), undefined);
});
Deno.test('SLRU remove entry, should return undefined', () => {
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.set('4', 4);
  slruCache.remove('3');
  assertEquals(slruCache.get('3'), undefined);
});

Deno.test(
  'SLRU set one more than allowed capacity, should not increase amount of keys',
  () => {
    const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
    slruCache.set('1', 1);
    slruCache.set('2', 2);
    slruCache.set('3', 3);
    slruCache.set('4', 4);
    slruCache.set('5', 5);
    slruCache.set('6', 6);
    assertEquals(slruCache.size, 3);
  }
);

Deno.test('SLRU clear should reset cache', () => {
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.set('4', 4);
  slruCache.set('5', 5);
  slruCache.clear();
  assertEquals(slruCache.peek('3'), undefined);
  assertEquals(slruCache.size, 0);
});

Deno.test('SLRU use with ttl', async () => {
  const slruCache = new SLRU({
    probationaryCache: 3,
    protectedCache: 3,
    stdTTL: 500,
  });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.set('4', 4);
  slruCache.set('5', 5);
  await sleep(600);
  assertEquals(slruCache.size, 0);
  assertEquals(slruCache.keys, []);
});

Deno.test('SLRU use with ttl, oveSLRUide ttl for specific set', async () => {
  const slruCache = new SLRU({
    probationaryCache: 3,
    protectedCache: 3,
    stdTTL: 500,
  });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.set('4', 4);
  slruCache.set('5', 5, 1000);
  await sleep(600);
  assertEquals(slruCache.size, 1);
  assertEquals(slruCache.keys, ['5']);
  await sleep(400);
});
Deno.test('SLRU forEach should print out the right key value pairs', () => {
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.set('4', 4);
  slruCache.set('5', 5);
  slruCache.remove('5');
  const testKeys: any[] = [];
  slruCache.forEach((i, index) => {
    testKeys.push(i.key);
  });
  console.log(testKeys);
  assertEquals(testKeys.length, 2);
});
Deno.test('SLRU when in protected cache, item will not be deleted', () => {
  const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
  slruCache.set('1', 1);
  slruCache.set('2', 2);
  slruCache.set('3', 3);
  slruCache.get('1');
  slruCache.get('2');
  slruCache.get('3');
  slruCache.set('4', 4);
  slruCache.set('5', 5);
  slruCache.set('6', 6);

  assertEquals(slruCache.size, 6);
  assertEquals(slruCache.ProtectedPartition.size(), 3);
});

Deno.test(
  'SLRU when protected cache is full item will be moved to probationary cache',
  () => {
    const slruCache = new SLRU({ probationaryCache: 3, protectedCache: 3 });
    slruCache.set('1', 1);
    slruCache.set('2', 2);
    slruCache.set('3', 3);
    slruCache.get('1');
    slruCache.get('2');
    slruCache.get('3');
    slruCache.set('4', 4);
    slruCache.get('4');
    slruCache.set('5', 5);
    slruCache.set('6', 6);

    assertEquals(slruCache.size, 6);
    assertEquals(slruCache.PropationaryPartition.peek('1'), 1);
  }
);
