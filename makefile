run:
	deno run -c tsconfig.json mod.ts

#usage: make bench filter=LRU 
bench:
	deno run -c tsconfig.json --allow-hrtime --allow-write --allow-read ./benchmark/runBenchmarks.ts $(filter)

utest:
	deno test ./test

format:
	deno fmt

debug:
	deno run -A --inspect-brk mod.ts

bundle:
	rm -rf build/
	mkdir build
	deno bundle mod.ts build/mod