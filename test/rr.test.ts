import { RR } from '../src/caches/rr.ts';
import { assertEquals } from '../deps.ts';

Deno.test('RR create Cache, should create a new empty cache', () => {
  const rrCache = new RR({ capacity: 5 });
  assertEquals(rrCache.size, 0);
});
Deno.test('RR create entry, and retrieve it', () => {
  const entry = { hello: 'asdf' };
  const rrCache = new RR({ capacity: 5 });
  rrCache.set(1, entry);
  assertEquals(rrCache.get(1), entry);
});
Deno.test(
  'RR get (non-existent) entry from empty cache, should return undefined',
  () => {
    const rrCache = new RR({ capacity: 5 });
    assertEquals(rrCache.get('key'), undefined);
  }
);

Deno.test('RR get non-existent entry, should return undefined', () => {
  const rrCache = new RR({ capacity: 5 });
  rrCache.set('1', 1);
  rrCache.set('2', 2);
  rrCache.set('3', 3);
  rrCache.set('4', 4);
  assertEquals(rrCache.get('key'), undefined);
});
Deno.test('RR remove entry, should return undefined', () => {
  const rrCache = new RR({ capacity: 5 });
  rrCache.set('1', 1);
  rrCache.set('2', 2);
  rrCache.set('3', 3);
  rrCache.set('4', 4);
  rrCache.remove('3');
  assertEquals(rrCache.get('3'), undefined);
});

Deno.test(
  'RR set one more than allowed capacity, should not increase amount of keys',
  () => {
    const rrCache = new RR({ capacity: 5 });
    rrCache.set('1', 1);
    rrCache.set('2', 2);
    rrCache.set('3', 3);
    rrCache.set('4', 4);
    rrCache.set('5', 5);
    rrCache.set('6', 6);
    assertEquals(rrCache.size, 5);
  }
);

Deno.test('RR clear should reset cache', () => {
  const rrCache = new RR({ capacity: 5 });
  rrCache.set('1', 1);
  rrCache.set('2', 2);
  rrCache.set('3', 3);
  rrCache.set('4', 4);
  rrCache.set('5', 5);
  rrCache.clear();
  assertEquals(rrCache.peek('3'), undefined);
  assertEquals(rrCache.size, 0);
});
