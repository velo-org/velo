import { formatBytes } from "../src/utils/formatBytes.ts";
import {
  runBenchmarks,
  BenchmarkResult,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
  platform,
} from "../dev_deps.ts";
import {
  CACHES,
  MARKDOWN_GROUPS,
  MARKDOWN_OUT,
  MAX_KEYS,
  RUNS,
} from "./benchmark.config.ts";

// benches
import "./benches/lru.bench.ts";
import "./benches/rr.bench.ts";
import "./benches/sc.bench.ts";
import "./benches/lfu.bench.ts";
import "./benches/slru.bench.ts";
import "./benches/arc.bench.ts";
import {
  defaultColumns,
  prettyBenchmarkDown,
} from "https://deno.land/x/pretty_benching@v0.2.2/pretty_benchmark_down.ts";

let filterRegex: RegExp | undefined;

if (Deno.args.length > 0 && Deno.args[0] !== "md") {
  const skip = CACHES.filter(
    (name) => !Deno.args[0].toUpperCase().split(",").includes(name)
  ).map((name) => `^${name}`);

  filterRegex = skip.length > 0 ? new RegExp(skip.join("|")) : undefined;
}

runBenchmarks({ silent: true, skip: filterRegex }, prettyBenchmarkProgress())
  .then(async (b) => {
    if (Deno.args.length > 0 && Deno.args.includes("md")) {
      const description = await generateDescription();

      prettyBenchmarkDown(
        (md) => {
          Deno.writeTextFileSync(MARKDOWN_OUT, md);
        },
        {
          title: "Benchmark Results",
          description: description,
          columns: [
            ...defaultColumns,
            {
              title: "Avg. Operations per ms",
              align: "left",
              toFixed: 0,
              formatter: (b: BenchmarkResult) => {
                return Math.floor(MAX_KEYS / b.measuredRunsAvgMs).toString();
              },
            },
          ],
          groups: MARKDOWN_GROUPS,
        }
      )(b);
    }
    return b;
  })
  .then(prettyBenchmarkResult())
  .catch((e: any) => {
    console.log(e);
  });

async function generateDescription() {
  let res;
  if (platform() === "linux") {
    res = await systemSpecLinux();
  } else {
    res = await systemSpecsWindows();
  }

  return `\`\`\`bash\nKEYS: ${MAX_KEYS}\nRUNS: ${RUNS}\nOS: ${platform()}\nCPU: ${
    res.cpu
  }\nRAM: ${res.memory}\n\`\`\``;
}

async function systemSpecLinux() {
  const cpuInfo = Deno.run({
    cmd: [
      "bash",
      "-c",
      'cat /proc/cpuinfo | grep "model name" | uniq | cut -d ":" -f2 ',
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const cores = Deno.run({
    cmd: [
      "bash",
      "-c",
      'cat /proc/cpuinfo | grep "cpu cores" | uniq | cut -d ":" -f2 ',
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const memory = Deno.run({
    cmd: [
      "bash",
      "-c",
      'cat /proc/meminfo | grep MemTotal | uniq | cut -d ":" -f2 ',
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const outputCPUInfo = await cpuInfo.output(); // "piped" must be set
  const outputMemory = await memory.output();
  const outputCores = await cores.output();
  const cpuInfoStr = new TextDecoder().decode(outputCPUInfo).trim();
  const coreStr = new TextDecoder().decode(outputCores).trim();
  const memStr = new TextDecoder().decode(outputMemory).trim();

  cores.close();
  cpuInfo.close();
  memory.close();

  return {
    cpu: `${cpuInfoStr} x ${coreStr}`,
    memory: formatBytes(Number(memStr.match(/(\d+)/)![0]) * 1024),
  };
}

async function systemSpecsWindows() {
  const cpuInfo = Deno.run({
    cmd: ["wmic", "cpu get Name /Format:List"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const cores = Deno.run({
    cmd: ["wmic", "cpu get NumberOfCores /Format:List"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const memory = Deno.run({
    cmd: ["wmic", "MemoryChip get Capacity"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const outputCPUInfo = await cpuInfo.output(); // "piped" must be set
  const outputMemory = await memory.output();
  const outputCores = await cores.output();
  const cpuInfoStr = new TextDecoder().decode(outputCPUInfo);
  const coreStr = new TextDecoder().decode(outputCores);
  const memStr = new TextDecoder().decode(outputMemory);

  let memSize = memStr.split("\n");
  let memRes = 0;
  memSize.shift();
  memSize.forEach((val) => {
    if (!isNaN(Number(val))) {
      memRes += Number(val);
    }
  });

  const memorySizeString = formatBytes(memRes);
  return {
    cpu: `${cpuInfoStr.split("=")[1]} x ${coreStr.split("=")[1]}`,
    memory: memorySizeString,
  };
}
