.PHONY: benchmark examples test debug bundle

benchmark:
	deno bench --unstable ./benchmark/run_groups.ts

examples:
	deno run --allow-env examples/policy/arc.example.ts
	deno run --allow-env examples/policy/w_tiny_lfu.example.ts
	deno run --allow-env examples/cache_creation_and_options.example.ts
	deno run --allow-env examples/events.example.ts
	deno run --allow-env examples/loading_cache.example.ts
	deno run --allow-env examples/ttl.example.ts
	deno run --allow-env examples/typed_cache.example.ts
	deno run --allow-env examples/removal_listener.example.ts

test:
	deno test --unstable --allow-read --allow-env ./test

debug:
	deno run -A --inspect-brk mod.ts

bundle:
	rm -rf build/
	mkdir build
	deno bundle mod.ts build/mod