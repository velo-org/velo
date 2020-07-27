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
|ARC set x100000|10|133.678|13.368|7480|
|ARC get x100000|10|106.064|10.606|9428|
|ARC update x100000|10|85.655|8.565|11674|
|ARC evict x100000|10|245.362|24.536|4075|

## LFU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|LFU set x100000|10|108.884|10.888|9184|
|LFU get x100000|10|113.836|11.384|8784|
|LFU update x100000|10|122.679|12.268|8151|
|LFU evict x100000|10|266.050|26.605|3758|

## LRU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|LRU set x100000|10|91.675|9.167|10908|
|LRU get x100000|10|51.445|5.145|19438|
|LRU update x100000|10|93.294|9.329|10718|
|LRU evict x100000|10|114.935|11.493|8700|

## RR
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|RR set x100000|10|69.240|6.924|14442|
|RR get x100000|10|29.312|2.931|34115|
|RR update x100000|10|72.025|7.202|13884|
|RR evict x100000|10|99.734|9.973|10026|

## SC
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|SC set x100000|10|85.207|8.521|11736|
|SC get x100000|10|61.627|6.163|16226|
|SC update x100000|10|97.934|9.793|10210|
|SC evict x100000|10|124.251|12.425|8048|

## SLRU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|SLRU set x100000|10|248.805|24.881|4019|
|SLRU get x100000|10|160.265|16.027|6239|
|SLRU update x100000|10|250.871|25.087|3986|
|SLRU evict x100000|10|301.901|30.190|3312|
