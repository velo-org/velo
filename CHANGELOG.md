# Changelog

All notable changes to this project will be documented in this file.

The document format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## unreleased
- 
## [1.0.0]

- Add Builder API for creating a cache (`Velo.builder()`)
- Add value loading functionality with `VeloLoadingCache` 
- Statistic functionality is now optional and can be enabled via the builder (`.stats()`)
- Events functionality is now optional and can be enabled via the builder (`.events()`)
- TTL functionality is now optional and can be enabled via the builder (`.ttl(ms: number)`)
- Expose cache configuration (`cache.options`)
- Add the W-TinyLFU admission policy
- Add removal listener functionality
- Reimplement entry expiration using a TimerWheel  
- Remove the following cache policies:
  - Random Replacement (`RR`)
  - Segmented LRU (`SLRU`)
- Update examples according to the new/removed features

## [0.1.6]

- Bump deno/std to 0.155.0
- Use deno v1.25.2

## [0.1.5]

- Fix [#4](https://github.com/velo-org/velo/issues/4)
- Bump deno/std to 0.84.0
- Use deno 1.7

## [0.1.4]

- Bump `deno/std`

## [0.1.3]

- Add cache statistics

## [0.1.2]

- Add cache events

## [0.1.0]

- Initial Release
