.PHONY: benchmark examples test debug bundle

benchmark:
	deno bench --unstable ./benchmark/run_groups.ts

examples:
	cd ./examples
	deno run --allow-env ./policy/arc.example.ts
	deno run --allow-env ./policy/w_tiny_lfu.example.ts
	deno run --allow-env cache_creation_and_options.example.ts
	deno run --allow-env events.example.ts
	deno run --allow-env loading_cache.example.ts
	deno run --allow-env ttl.example.ts
	deno run --allow-env typed_cache.example.ts

test:
	deno test --unstable --allow-read --allow-env ./test

debug:
	deno run -A --inspect-brk mod.ts

bundle:
	rm -rf build/
	mkdir build
	deno bundle mod.ts build/mod