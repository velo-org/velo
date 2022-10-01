<p align="center">
<img src="https://raw.githubusercontent.com/velo-org/velo/master/media/velo-logo.svg" width="200">

<h1 align="center">Velo</h1>
<blockquote align="center">Performant in-memory caching library for Deno</blockquote>
</p>
<p align="center">
  <a href="https://github.com/velo-org/velo/actions?query=workflow%3Atests">
    <img src="https://github.com/velo-org/velo/workflows/tests/badge.svg">
  </a>
  <a href="https://github.com/velo-org/velo/releases">
    <img src="https://img.shields.io/github/v/tag/velo-org/velo?label=version">
  </a>
  <a href="https://doc.deno.land/https/deno.land/x/velo@0.1.6/mod.ts">
    <img src="https://img.shields.io/badge/%E2%80%8E-docs-blue.svg?logo=deno">
  </a>
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Quick start](#quick-start)
- [Caches](#caches)
- [Usage](#usage)
- [Contributing](#contributing)
- [Benchmarks](#benchmarks)

## Introduction

Velo is an in-memory caching library for Deno. We provide a high-performance cache implementation with an API inspired by [Google Guava's Cache](https://github.com/google/guava/wiki/CachesExplained). While it can be ineffectual to optimize JavaScript we draw significant performance increases from using a [custom pointer system](https://yomguithereal.github.io/posts/lru-cache#a-custom-pointer-system). For more details, see our [examples](./examples/) and browse the [API documentation](https://doc.deno.land/https/deno.land/x/velo@0.1.6/mod.ts).

## Install

Import `Velo` from one of the following urls.

- from `deno.land/x`

```ts
import { Velo } from "https://deno.land/x/velo@0.1.6/mod.ts";
```

- [![nest badge](https://nest.land/badge.svg)](https://nest.land/package/velo)

```ts
import { Velo } from "https://x.nest.land/velo@0.1.6/mod.ts";
```

## Usage

```ts
const cache = Velo.capacity(10_000)
  .ttl(2 * 60 * 1000) // 2 minutes
  .events()
  .lru()
  .build();
```

Velo provides a builder class to create a cache. Multipe optional features can be enabled:

- `ttl()`: time-based eviction of keys
- `events()`: uses an `EventEmitter` to notify you about certain cache events
- ``


## Contributing

If you want to contribute to the project please read through our
[contributing guidelines](./CONTRIBUTING.md).

## Benchmarks

- [Velo Benchmarks](./benchmark/results.md)
- [Velo LRU compared to other Deno in memory
  caches](https://github.com/velo-org/velo-benchmarks#readme)
