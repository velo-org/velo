# Benchmark Results

Config:
```bash
KEYS: 100000
RUNS: 10
```
## ARC
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|ARC set x100000|10|82.765|8.276|12082|
|ARC get x100000|10|49.927|4.993|20029|
|ARC update x100000|10|41.584|4.158|24047|
|ARC evict x100000|10|188.375|18.838|5308|

## LFU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|LFU set x100000|10|76.881|7.688|13007|
|LFU get x100000|10|54.518|5.452|18342|
|LFU update x100000|10|60.865|6.087|16429|
|LFU evict x100000|10|172.546|17.255|5795|

## LRU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|LRU set x100000|10|53.128|5.313|18822|
|LRU get x100000|10|28.390|2.839|35224|
|LRU update x100000|10|45.518|4.552|21969|
|LRU evict x100000|10|60.645|6.065|16489|

## RR
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|RR set x100000|10|44.537|4.454|22453|
|RR get x100000|10|19.761|1.976|50603|
|RR update x100000|10|46.148|4.615|21669|
|RR evict x100000|10|67.826|6.783|14743|

## SC
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|SC set x100000|10|41.282|4.128|24223|
|SC get x100000|10|27.188|2.719|36780|
|SC update x100000|10|45.218|4.522|22115|
|SC evict x100000|10|64.390|6.439|15530|

## SLRU
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|---|---|---|---|---|
|SLRU set x100000|10|176.572|17.657|5663|
|SLRU get x100000|10|111.682|11.168|8954|
|SLRU update x100000|10|215.776|21.578|4634|
|SLRU evict x100000|10|167.598|16.760|5966|
