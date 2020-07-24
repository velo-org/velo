import { SC } from '../mod.ts';

/*
 * https://www.geeksforgeeks.org/second-chance-or-clock-page-replacement-policy/
 *
 * In the Second Chance page replacement policy, the candidate pages for
 * removal are considered in a round robin matter, and a page that has been
 * accessed between consecutive considerations will not be replaced. The page
 * replaced is the one that, when considered in a round robin matter, has not
 * been accessed since its last consideration.
 */

const scc = new SC({ capacity: 5 }); // init Second Chance Cache with max 5 key-value pairs

scc.set('1', { hello: 'asdf' }); // sets 1
scc.set('2', { hello: 'asdf' }); // sets 2
scc.set('3', { hello: 'asdf' }); // sets 3
scc.set('4', { hello: 'asdf' }); // sets 4
scc.set('5', { hello: 'asdf' }); // sets 5

scc.get('1'); // gets 2 second Chance gets activated

scc.set('6', { hello: 'asdfdd' }); // sets 6 removes 2
scc.set('7', { hello: 'asdfdd' }); // sets 7 remove 1
