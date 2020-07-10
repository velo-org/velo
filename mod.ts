import { LRUCache } from './src/caches/lruCache.ts';
import { RRCache } from './src/caches/rrCache.ts';
const lruc = new LRUCache({ maxCache: 5 });
lruc.set('1', { hello: 'asdf' });
lruc.set('2', { hello: 'asdf' });
lruc.set('3', { hello: 'asdf' });
lruc.set('4', { hello: 'asdf' });
lruc.set('5', { hello: 'asdf' });

console.log(lruc.get('1'));

lruc.set('6', { hello: 'asdfdd' });
console.log(lruc.Storage);
const rrc = new RRCache({ maxCache: 5 });
rrc.set('1', { hello: 'asdf' });
rrc.set('2', { hello: 'asdf' });
rrc.set('3', { hello: 'asdf' });
rrc.set('4', { hello: 'asdf' });
rrc.set('5', { hello: 'asdf' });

console.log(rrc.get('1'));

rrc.set('6', { hello: 'asdfdd' });
console.log(rrc.Storage);
