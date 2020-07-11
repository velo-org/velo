import {
  runBenchmarks,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
} from '../deps.ts';

// benches
import './benches/lruCache.bench.ts';

let filterRegex;

if (Deno.args.length > 0) {
  const skip = ['LRU'].filter((c) => !Deno.args.includes(c));
  filterRegex = skip.length > 0 ? new RegExp(skip.join('|')) : undefined;
}

runBenchmarks({ silent: true, skip: filterRegex }, prettyBenchmarkProgress())
  .then(prettyBenchmarkResult())
  .catch((e: any) => {
    console.log(e);
  });
