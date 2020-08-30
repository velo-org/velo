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
|ARC set x100000|10|105.350|10.535|9492|
|ARC get x100000|10|38.990|3.899|25647|
|ARC update x100000|10|64.357|6.436|15538|
|ARC evict x100000|10|212.919|21.292|4696|


## LFU

https://github.com/velo-org/velo/blob/master/src/caches/lfu.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|LFU set x100000|10|86.724|8.672|11530|
|LFU get x100000|10|68.703|6.870|14555|
|LFU update x100000|10|80.992|8.099|12346|
|LFU evict x100000|10|172.690|17.269|5790|


## LRU

https://github.com/velo-org/velo/blob/master/src/caches/lru.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|LRU set x100000|10|59.653|5.965|16763|
|LRU get x100000|10|31.089|3.109|32165|
|LRU update x100000|10|59.546|5.955|16793|
|LRU evict x100000|10|72.253|7.225|13840|


## RR

https://github.com/velo-org/velo/blob/master/src/caches/rr.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|RR set x100000|10|55.340|5.534|18070|
|RR get x100000|10|15.915|1.592|62832|
|RR update x100000|10|53.459|5.346|18706|
|RR evict x100000|10|102.674|10.267|9739|


## SC

https://github.com/velo-org/velo/blob/master/src/caches/sc.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|SC set x100000|10|69.266|6.927|14437|
|SC get x100000|10|26.718|2.672|37428|
|SC update x100000|10|51.705|5.171|19340|
|SC evict x100000|10|86.499|8.650|11560|


## SLRU

https://github.com/velo-org/velo/blob/master/src/caches/slru.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|SLRU set x100000|10|208.273|20.827|4801|
|SLRU get x100000|10|114.429|11.443|8739|
|SLRU update x100000|10|219.932|21.993|4546|
|SLRU evict x100000|10|181.571|18.157|5507|



