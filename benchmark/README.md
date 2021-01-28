# Benchmark Results

```bash
KEYS: 100000
RUNS: 10
OS: linux
CPU: Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz x 4
RAM: 7.66 GB
```

## ARC

https://github.com/velo-org/velo/blob/master/src/caches/arc.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|ARC set x100000|10|99.406|9.941|10059|
|ARC get x100000|10|38.262|3.826|26135|
|ARC update x100000|10|64.559|6.456|15489|
|ARC evict x100000|10|220.211|22.021|4541|


## LFU

https://github.com/velo-org/velo/blob/master/src/caches/lfu.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|LFU set x100000|10|82.780|8.278|12080|
|LFU get x100000|10|56.553|5.655|17682|
|LFU update x100000|10|87.285|8.728|11456|
|LFU evict x100000|10|167.403|16.740|5973|


## LRU

https://github.com/velo-org/velo/blob/master/src/caches/lru.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|LRU set x100000|10|69.127|6.913|14466|
|LRU get x100000|10|25.781|2.578|38787|
|LRU update x100000|10|49.879|4.988|20048|
|LRU evict x100000|10|64.326|6.433|15545|


## RR

https://github.com/velo-org/velo/blob/master/src/caches/rr.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|RR set x100000|10|54.438|5.444|18369|
|RR get x100000|10|17.390|1.739|57505|
|RR update x100000|10|55.526|5.553|18009|
|RR evict x100000|10|105.285|10.529|9498|


## SC

https://github.com/velo-org/velo/blob/master/src/caches/sc.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|SC set x100000|10|75.300|7.530|13280|
|SC get x100000|10|26.371|2.637|37920|
|SC update x100000|10|51.533|5.153|19405|
|SC evict x100000|10|89.764|8.976|11140|


## SLRU

https://github.com/velo-org/velo/blob/master/src/caches/slru.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|SLRU set x100000|10|203.673|20.367|4909|
|SLRU get x100000|10|95.244|9.524|10499|
|SLRU update x100000|10|222.932|22.293|4485|
|SLRU evict x100000|10|200.107|20.011|4997|



