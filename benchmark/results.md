# Benchmark Results

Config:
```bash
KEYS: 100000
RUNS: 10
OS: linux
CPU: Intel(R) Core(TM) i7-5600U CPU @ 2.60GHz x 4
RAM: 7.67 GB
```
## ARC
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|ARC set x100000|10|135.976|13.598|7354|
|ARC get x100000|10|90.635|9.064|11033|
|ARC update x100000|10|97.782|9.778|10226|
|ARC evict x100000|10|249.652|24.965|4005|

## LFU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|LFU set x100000|10|147.485|14.749|6780|
|LFU get x100000|10|127.431|12.743|7847|
|LFU update x100000|10|134.601|13.460|7429|
|LFU evict x100000|10|257.546|25.755|3882|

## LRU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|LRU set x100000|10|85.323|8.532|11720|
|LRU get x100000|10|62.344|6.234|16039|
|LRU update x100000|10|87.910|8.791|11375|
|LRU evict x100000|10|168.288|16.829|5942|

## RR
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|RR set x100000|10|87.346|8.735|11448|
|RR get x100000|10|51.994|5.199|19232|
|RR update x100000|10|119.404|11.940|8374|
|RR evict x100000|10|176.947|17.695|5651|

## SC
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|SC set x100000|10|124.900|12.490|8006|
|SC get x100000|10|56.917|5.692|17569|
|SC update x100000|10|87.627|8.763|11412|
|SC evict x100000|10|130.985|13.099|7634|

## SLRU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|SLRU set x100000|10|242.557|24.256|4122|
|SLRU get x100000|10|132.275|13.228|7560|
|SLRU update x100000|10|347.890|34.789|2874|
|SLRU evict x100000|10|314.408|31.441|3180|
