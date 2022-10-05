#usage: make bench filter=LRU out=md
bench:
	deno run --allow-hrtime --allow-write --allow-read --unstable --allow-env --allow-run ./benchmark/runBenchmarks.ts $(filter) $(out)

utest:
	deno test --unstable --allow-read --allow-env ./test

debug:
	deno run -A --inspect-brk mod.ts

bundle:
	rm -rf build/
	mkdir build
	deno bundle mod.ts build/mod