<p align="center">
<img src="./media/velo-logo.svg" width="200">

<h1 align="center">Velo</h1>
<blockquote align="center">Performant caching for Deno</blockquote>
</p>
<p align="center">
<a href="https://github.com/velo-org/velo/actions?query=workflow%3Atests">
    <img src="https://github.com/velo-org/velo/workflows/tests/badge.svg">
  </a>
  <a href="https://github.com/velo-org/velo/releases">
    <img src="https://img.shields.io/github/v/tag/velo-org/velo?label=version">
  </a>
</p>

## Table of Contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Caches](#caches)
- [Usage](#usage)
- [Contributing](#contributing)
- [Benchmarks](#benchmarks)


## Introduction

This library aims to bring you in memory caching, while trying to be as performant as possible for a high level language. Several caching policies are supported. Keys can have a timeout (ttl) after which they expire and are deleted from the cache. And the events can be emitted for different cache opterations.

## Quick start

With Deno it's very easy to use third party libraries. Just import from one of the following urls.

- from `deno.land/x`

```ts
import { [cache-name] } from "https://deno.land/x/velo@v0.1.2/mod.ts";
```

- from `nest.land`

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/velo)

```ts
import { [cache-name] } from "https://x.nest.land/velo@0.1.2/mod.ts";
```

## Caches

- ARC Cache (adaptive-replacement-cache)
- LFU Cache (least-frequently-used)
- LRU Cache (least-recently-used)
- RR Cache (random-replacement)
- SC Cache (second-chance)
- SLRU Cache (segmented-least-recently-used)

## Usage

All caches share the same set of methods.

```ts
import { LRU } from "https://deno.land/x/velo@v0.1.2/mod.ts";

const lru = new LRU({ capacity: 5 });

lru.set(1, 1);
lru.get(1);
lru.delete(1);

lru.set(2, 2, 60000); // with ttl

// event
lru.on("expired", (k, v) => {
  console.log(k, v);
});
```

For more detailed examples take a look at the [examples folder](./examples).

## Contributing

If you want to contribute to the project please read through our [contributing guidelines](./CONTRIBUTING.md).

## Benchmarks

- [Velo Benchmarks](./benchmark/results.md)
- [Velo LRU compared to other Deno in memory caches](https://github.com/velo-org/velo-benchmarks#readme)
