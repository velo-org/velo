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
- [Benchmarks](#benchmarks)
- [Contributing](#contributing)

## Introduction

This library aims to bring you in memory caching, while trying to be as performant as possible for a high level language. It also features several caching policies like LRU(least-recently-used) or LFU(least-frequently-used).

## Quick start

With Deno it's very easy to use third party libraries. Just import any cache you like with the following syntax:

`import {<Cache Name>} from 'https://deno.land/x/velo/mod.ts'`

## Caches

- RR Cache (random-replacement)
- SC Cache (second-chance)
- LRU Cache (least-recently-used)
- LFU Cache (least-frequently-used)
- SLRU Cache (segmented-least-recently-used)
- ARC Cache (adaptive-replacement-cache)

## Usage

For Examples on how to use our caches please refer to the [examples folder](./examples).

## Contributing

If you want to contribute to our project please read through our [contributing guidelines](./CONTRIBUTING.md).

## Benchmarks

Check out our Benchmarks [here](./benchmark/results.md).
