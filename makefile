run:
	deno run mod.ts
test:
	deno test
format:
	deno fmt
debug:
	deno run -A --inspect-brk mod.ts
bundle:
	rm -rf build/
	mkdir build
	deno bundle mod.ts build/mod