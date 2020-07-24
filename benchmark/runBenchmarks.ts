import {
  runBenchmarks,
  BenchmarkResult,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
} from '../deps.ts';
import { CACHES, MARKDOWN_OUT, MAX_KEYS, RUNS } from './benchmark.config.ts';

// benches
import './benches/lru.bench.ts';
import './benches/rr.bench.ts';
import './benches/sc.bench.ts';
import './benches/lfu.bench.ts';
import './benches/slru.bench.ts';
import './benches/arc.bench.ts';

let filterRegex: RegExp | undefined;

if (Deno.args.length > 0 && Deno.args[0] !== 'md') {
  const skip = CACHES.filter(
    (name) => !Deno.args[0].split(',').includes(name)
  ).map((name) => `^${name}`);

  filterRegex = skip.length > 0 ? new RegExp(skip.join('|')) : undefined;
}

runBenchmarks({ silent: true, skip: filterRegex }, prettyBenchmarkProgress())
  .then((b) => {
    if (Deno.args.length > 0 && Deno.args.includes('md')) {
      generateMarkdown(b.results);
    }
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
    `# Benchmark Results\n\nConfig:\n\`\`\`bash\nKEYS: ${MAX_KEYS}\nRUNS: ${RUNS}\n\`\`\``
  );

  CACHES.forEach((c) => {
    Deno.writeFileSync(
      MARKDOWN_OUT,
      encoder.encode(
        `\n## ${c}\n|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|\n|---|---|---|---|---|\n`
      ),
      {
        append: true,
      }
    );

    const nameRegex = new RegExp(`^${c}`);

    results
      .filter((r) => r.name.match(nameRegex))
      .forEach((r) => {
        const totalMs = r.totalMs.toFixed(3);
        const avgMs = r.measuredRunsAvgMs.toFixed(3);
        const opsPerMs = Math.floor(MAX_KEYS / r.measuredRunsAvgMs);
        const row = `|${r.name}|${r.runsCount}|${totalMs}|${avgMs}|${opsPerMs}|\n`;

        Deno.writeFileSync(MARKDOWN_OUT, encoder.encode(row), {
          append: true,
        });
      });
  });
}
