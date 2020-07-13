import {
  runBenchmarks,
  BenchmarkResult,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
} from '../deps.ts';
import { CACHES, MARKDOWN_OUT } from './benchmark.config.ts';

// benches
//import './benches/lruCache.bench.ts';
//import './benches/rrCache.bench.ts';
import './benches/scCache.bench.ts';

let filterRegex: RegExp | undefined;

if (Deno.args.length > 0) {
  const skip = CACHES.filter((c) => !Deno.args.includes(c));
  filterRegex = skip.length > 0 ? new RegExp(skip.join('|')) : undefined;
}

runBenchmarks({ silent: true, skip: filterRegex }, prettyBenchmarkProgress())
  .then((b) => {
    generateMarkdown(b.results);
    return b;
  })
  .then(prettyBenchmarkResult())
  .catch((e: any) => {
    console.log(e);
  });

function generateMarkdown(results: BenchmarkResult[]) {
  const encoder = new TextEncoder();

  Deno.writeTextFileSync(
    MARKDOWN_OUT,
    '|Name|Runs|Total (ms)|Average (ms)|\n|---|---|---|---|\n'
  );

  results.forEach((r) => {
    const row = `|${r.name}|${r.runsCount}|${r.totalMs.toFixed(
      3
    )}|${r.measuredRunsAvgMs.toFixed(3)}|\n`;

    Deno.writeFileSync(MARKDOWN_OUT, encoder.encode(row), {
      append: true,
    });
  });
}
