<p align="center">
<img src="https://raw.githubusercontent.com/velo-org/velo/master/media/velo-logo.svg" width="200">

<h1 align="center">Velo</h1>
<blockquote align="center">A high-performance caching library</blockquote>
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

- [Introduction](#introduction)
- [Usage](#usage)
- [Features Overview](#features-overview)
- [Performance](#performance)

## Introduction

Velo is an in-memory caching library for Deno focusing on high throughput and hit rate. It provides a simple API, multiple cache strategies, and a variety of optional features. For more details, take a look at our [examples](./examples/) and browse the [documentation](https://doc.deno.land/https/deno.land/x/velo@0.1.6/mod.ts).

## Features Overview
- Size-based eviction
- Multiple cache strategies (LRU, LFU, ARC, SC, W-TinyLFU)
- Automated loading of entries into the cache 
- Time-based expiration of entries
- Listener for cache removals (eviction, expiration, overwrite, manual removal)
- EventEmitter for cache events
- Collecting cache hit and miss statistics


## Usage

- Install from `deno.land/x`

```ts
import { Velo } from "https://deno.land/x/velo@0.1.6/mod.ts";
```
- [![nest badge](https://nest.land/badge.svg)](https://nest.land/package/velo)

```ts
import { Velo } from "https://x.nest.land/velo@0.1.6/mod.ts";
```

`Velo` is a builder class to create a cache instance.

```ts
const cache = Velo.builder<string, User>()
  .capacity(100_000)
  .ttl(120_000) // 2 minutes
  .events()
  .build();

cache.set("u:1", { id: "1", name: "John Doe" });
cache.set("u:2", { id: "2", name: "Jane Doe" });

cache.get("u:1"); // { id: "1", name: "John Doe" }
```

For more detailed explanation and usage guides look at the [examples](./examples/).

## Performance

Velo is designed to be fast. It utilizes a fixed-capacity doubly-linked list as internal data structure for policy implementations. This list relies on a custom pointer system inspired by the [mnemonist lru cache](https://github.com/Yomguithereal/mnemonist/blob/master/lru-cache.js), which employs TypedArrays to circumvent bookkeeping overhead.

### Benchmarks

In [velo-benchmarks](https://github.com/velo-org/velo-benchmarks) we provide a set of benchmarks to compare the performance of Velo with other caching libraries. Both hit rate and throughput are measured.
