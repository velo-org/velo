import { LRUCache } from './src/caches/lruCache.ts';
import { RRCache } from './src/caches/rrCache.ts';
import { SCChache } from './src/caches/scCache.ts';

console.log('===========================');
console.log('LRU CACHE');
console.log('===========================');

const lruc = new LRUCache({ maxCache: 5 });
lruc.set(1, { hello: 'asdf' });
lruc.set('2', { hello: 'asdf' });
lruc.set('3', { hello: 'asdf' });
lruc.set('4', { hello: 'asdf' });
lruc.set('5', { hello: 'asdf' });

lruc.get('2');
lruc.set('6', { hello: 'asdfdd' });
lruc.set('7', { hello: 'asdfdd' });
lruc.set(8, { hello: 'asdfdd' });
lruc.forEach((item, index) => {
  console.log(index, item);
});

console.log('===========================');
console.log('RR CACHE');
console.log('===========================');

const rrc = new RRCache({ maxCache: 5 }); // init Random Replacement Cache with max 5 key-value pairs
rrc.set('1', { hello: 'asdf' }); // sets 1
rrc.set('2', { hello: 'asdf' }); // sets 2
rrc.set('3', { hello: 'asdf' }); // sets 3
rrc.set('4', { hello: 'asdf' }); // sets 4
rrc.set('5', { hello: 'asdf' }); // sets 5

rrc.set('6', { hello: 'asdfdd' }); // sets 6 removes random entry
rrc.set('7', { hello: 'asdfdd' });
rrc.set('8', { hello: 'asdfdd' });
rrc.forEach((item, index) => {
  console.log(index, item);
});

console.log('===========================');
console.log('SC CACHE');
console.log('===========================');

const scc = new SCChache({ maxCache: 5 }); // init Second Chance Cache with max 5 key-value pairs
scc.set('1', { hello: 'asdf' }); // sets 1
scc.set('2', { hello: 'asdf' }); // sets 2
scc.set('3', { hello: 'asdf' }); // sets 3
scc.set('4', { hello: 'asdf' }); // sets 4
scc.set('5', { hello: 'asdf' }); // sets 5
console.log(scc.get('1')); // gets 2 second Chance gets activated
scc.set('6', { hello: 'asdfdd' }); // sets 6 removes 2

scc.set('7', { hello: 'asdfdd' }); // sets 7 remove 1
scc.set('8', { hello: 'asdfdd' });
scc.set('9', { hello: 'asdfdd' });
console.log(scc.get('5'));
console.log(scc.get('6'));
scc.set('10', { hello: 'asdfdd' });
scc.forEach((i, ind) => {
  console.log(i, ind);
});
