import { platform } from "https://deno.land/std@0.155.0/node/os.ts";
import {
  runBenchmarks,
  bench,
} from "https://deno.land/std@0.155.0/testing/bench.ts";

import {
  defaultColumns,
  prettyBenchmarkDown,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
} from "https://deno.land/x/pretty_benching@v0.3.3/mod.ts";

export {
  bench,
  defaultColumns,
  platform,
  prettyBenchmarkDown,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
  runBenchmarks,
};

import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.155.0/testing/asserts.ts";

export { assert, assertEquals };
