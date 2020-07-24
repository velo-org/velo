# Benchmark Results

Config:
```bash
KEYS: 100000
RUNS: 10
```
## ARC
|Name|Runs|Total (ms)|Average (ms)|
|---|---|---|---|
|ARC set x100000|10|84.327|8.433|
|ARC get x100000|10|34.685|3.468|
|ARC update x100000|10|52.763|5.276|
|ARC evict x100000|10|236.803|23.680|

## LFU
|Name|Runs|Total (ms)|Average (ms)|
|---|---|---|---|
|LFU set x100000|10|70.107|7.011|
|LFU get x100000|10|55.334|5.533|
|LFU update x100000|10|69.707|6.971|
|LFU evict x100000|10|194.873|19.487|

## LRU
|Name|Runs|Total (ms)|Average (ms)|
|---|---|---|---|
|LRU set x100000|10|44.434|4.443|
|LRU get x100000|10|34.029|3.403|
|LRU update x100000|10|46.912|4.691|
|LRU evict x100000|10|52.749|5.275|

## RR
|Name|Runs|Total (ms)|Average (ms)|
|---|---|---|---|
|RR set x100000|10|48.067|4.807|
|RR get x100000|10|20.443|2.044|
|RR update x100000|10|54.121|5.412|
|RR evict x100000|10|80.172|8.017|

## SC
|Name|Runs|Total (ms)|Average (ms)|
|---|---|---|---|
|SC set x100000|10|45.218|4.522|
|SC get x100000|10|28.758|2.876|
|SC update x100000|10|45.650|4.565|
|SC evict x100000|10|70.292|7.029|

## SLRU
|Name|Runs|Total (ms)|Average (ms)|
|---|---|---|---|
|SLRU set x100000|10|150.725|15.072|
|SLRU get x100000|10|107.331|10.733|
|SLRU update x100000|10|174.584|17.458|
|SLRU evict x100000|10|151.115|15.111|
