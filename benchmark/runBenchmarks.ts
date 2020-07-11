import {
  runBenchmarks,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
} from '../deps.ts';

// benches
import './benches/lruCache.bench.ts';

runBenchmarks({ silent: true }, prettyBenchmarkProgress())
  .then(prettyBenchmarkResult())
  .catch((e: any) => {
    console.log(e);
  });
