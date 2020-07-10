run:
	deno run -c tsconfig.json mod.ts
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