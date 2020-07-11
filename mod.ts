import { LRUCache } from './src/caches/lruCache.ts';
import { RRCache } from './src/caches/rrCache.ts';

console.log('===========================');
console.log('LRU CACHE');
console.log('===========================');

const lruc = new LRUCache({ maxCache: 5 });
lruc.set('1', { hello: 'asdf' });
lruc.set('2', { hello: 'asdf' });
lruc.set('3', { hello: 'asdf' });
lruc.set('4', { hello: 'asdf' });
lruc.set('5', { hello: 'asdf' });

lruc.set('6', { hello: 'asdfdd' });
lruc.set('7', { hello: 'asdfdd' });
lruc.set('8', { hello: 'asdfdd' });
lruc.forEach((item, index) => {
  console.log(index, item);
});

console.log('===========================');
console.log('RR CACHE');
console.log('===========================');

const rrc = new RRCache({ maxCache: 5 });
rrc.set('1', { hello: 'asdf' });
rrc.set('2', { hello: 'asdf' });
rrc.set('3', { hello: 'asdf' });
rrc.set('4', { hello: 'asdf' });
rrc.set('5', { hello: 'asdf' });

rrc.set('6', { hello: 'asdfdd' });
rrc.set('7', { hello: 'asdfdd' });
rrc.set('8', { hello: 'asdfdd' });
rrc.forEach((item, index) => {
  console.log(index, item);
});
