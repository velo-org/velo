import * as Log from 'https://deno.land/std/log/mod.ts';
import {
  runBenchmarks,
  bench,
  BenchmarkResult,
} from 'https://deno.land/std/testing/bench.ts';
import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';

export { Log, runBenchmarks, bench, BenchmarkResult, assert, assertEquals };

import {
  prettyBenchmarkResult,
  prettyBenchmarkProgress,
} from 'https://deno.land/x/pretty_benching@v0.1.1/mod.ts';

export { prettyBenchmarkProgress, prettyBenchmarkResult };
