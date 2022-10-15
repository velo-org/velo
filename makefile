#usage: make bench filter=LRU out=md
bench:
	deno run --allow-hrtime --allow-write --allow-read --unstable --allow-env --allow-run ./benchmark/runBenchmarks.ts $(filter) $(out)

examples:
	cd ./examples
	deno run --allow-env ./policy/arc.example.ts
	deno run --allow-env ./policy/w_tiny_lfu.example.ts
	deno run --allow-env cache_creation_and_options.example.ts
	deno run --allow-env events.example.ts
	deno run --allow-env loading_cache.example.ts
	deno run --allow-env ttl.example.ts
	deno run --allow-env typed_cache.example.ts

utest:
	deno test --unstable --allow-read --allow-env ./test

debug:
	deno run -A --inspect-brk mod.ts

bundle:
	rm -rf build/
	mkdir build
	deno bundle mod.ts build/mod