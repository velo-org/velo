import { platform } from "https://deno.land/std/node/os.ts";
import {
  runBenchmarks,
  bench,
  BenchmarkResult,
} from "https://deno.land/std@0.67.0/testing/bench.ts";

import {
  prettyBenchmarkResult,
  prettyBenchmarkProgress,
  prettyBenchmarkDown,
  defaultColumns,
} from "https://deno.land/x/pretty_benching@v0.2.3/mod.ts";

export {
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
  prettyBenchmarkDown,
  defaultColumns,
  platform,
  runBenchmarks,
  bench,
  BenchmarkResult,
};

import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.67.0/testing/asserts.ts";

export { assert, assertEquals };
