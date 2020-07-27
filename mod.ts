export { LRU } from './src/caches/lru.ts';
export { RR } from './src/caches/rr.ts';
export { SC } from './src/caches/sc.ts';
export { LFU } from './src/caches/lfu.ts';
export { SLRU } from './src/caches/slru.ts';
export { ARC } from './src/caches/arc.ts';
export { Key } from './src/models/key.ts';
export { Options } from './src/models/options.ts';
export { SLRUOptions } from './src/models/slruOptions.ts';

import { LRU } from './src/caches/lru.ts';
import { RR } from './src/caches/rr.ts';
import { SC } from './src/caches/sc.ts';
import { LFU } from './src/caches/lfu.ts';

console.log('===========================');
console.log('LRU CACHE');
console.log('===========================');

const lruc = new LRU({ capacity: 5 });
lruc.set(1, { hello: 'asdf' });
lruc.set('2', { hello: 'asdf' });
lruc.set('3', { hello: 'asdf' });
lruc.set('4', { hello: 'asdf' });
lruc.set('5', { hello: 'asdf' });

lruc.remove('5');

lruc.set('6', { hello: 'asdfdd' });
lruc.get('2'); //26345

lruc.set('7', { hello: 'asdfdd' }); //72634
lruc.set(8, { hello: 'asdfdd' }); //87263
lruc.set('9', { hello: 'asdfdd' }); // 96872

lruc.get('4');
lruc.set('10', { hello: 'asdfsdf' });

lruc.forEach((item, index) => {
  console.log(index, item);
});

console.log('===========================');
console.log('RR CACHE');
console.log('===========================');

const rrc = new RR({ capacity: 5 }); // init Random Replacement Cache with max 5 key-value pairs
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

const scc = new SC({ capacity: 5 }); // init Second Chance Cache with max 5 key-value pairs
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

console.log('===========================');
console.log('LFU CACHE');
console.log('===========================');

const lfuc = new LFU({ capacity: 5 }); // init Second Chance Cache with max 5 key-value pairs
lfuc.set('1', { hello: 'asdf' }); // sets 1
lfuc.set('2', { hello: 'asdf' }); // sets 2
lfuc.set('3', { hello: 'asdf' }); // sets 3
lfuc.set('4', { hello: 'asdf' }); // sets 4
lfuc.set('5', { hello: 'asdf' }); // sets 5
console.log(lfuc.get('1')); // gets 2 second Chance gets activated
lfuc.set('6', { hello: 'asdfdd' }); // sets 6 removes 2

lfuc.set('7', { hello: 'asdfdd' }); // sets 7 remove 1
lfuc.set('8', { hello: 'asdfdd' });
lfuc.set('9', { hello: 'asdfdd' });

console.log(lfuc.get('6'));
lfuc.set('10', { hello: 'asdfdd' });
lfuc.remove('1');
lfuc.remove('6');
lfuc.remove('10');
lfuc.forEach((i, ind) => {
  console.log(i, ind);
});
