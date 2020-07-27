import * as Log from 'https://deno.land/std/log/mod.ts';
import { platform } from 'https://deno.land/std/node/os.ts';
import {
  runBenchmarks,
  bench,
  BenchmarkResult,
} from 'https://deno.land/std/testing/bench.ts';
import {
  assert,
  assertEquals,
} from 'https://deno.land/std@0.60.0/testing/asserts.ts';

export {
  Log,
  runBenchmarks,
  bench,
  BenchmarkResult,
  assert,
  assertEquals,
  platform,
};

import {
  prettyBenchmarkResult,
  prettyBenchmarkProgress,
} from 'https://deno.land/x/pretty_benching@v0.1.1/mod.ts';

export { prettyBenchmarkProgress, prettyBenchmarkResult };
