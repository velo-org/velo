# Benchmark Results

```bash
KEYS: 100000
RUNS: 10
OS: win32
CPU: AMD Ryzen 7 5800X 8-Core Processor             
RAM: 16.330 MB

```

## ARC

https://github.com/velo-org/velo/blob/master/src/caches/arc.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|ARC set x100000|10|63.624|6.362|15717|
|ARC get x100000|10|34.885|3.488|28666|
|ARC update x100000|10|35.164|3.516|28437|
|ARC evict x100000|10|145.279|14.528|6883|


## LFU

https://github.com/velo-org/velo/blob/master/src/caches/lfu.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|LFU set x100000|10|37.073|3.707|26974|
|LFU get x100000|10|26.508|2.651|37724|
|LFU update x100000|10|37.075|3.708|26972|
|LFU evict x100000|10|100.514|10.051|9948|


## LRU

https://github.com/velo-org/velo/blob/master/src/caches/lru.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|LRU set x100000|10|31.982|3.198|31267|
|LRU get x100000|10|11.430|1.143|87488|
|LRU update x100000|10|22.986|2.299|43504|
|LRU evict x100000|10|32.140|3.214|31113|


## RR

https://github.com/velo-org/velo/blob/master/src/caches/rr.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|RR set x100000|10|23.373|2.337|42783|
|RR get x100000|10|10.146|1.015|98558|
|RR update x100000|10|23.160|2.316|43178|
|RR evict x100000|10|46.904|4.690|21319|


## SC

https://github.com/velo-org/velo/blob/master/src/caches/sc.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|SC set x100000|10|32.300|3.230|30959|
|SC get x100000|10|12.271|1.227|81495|
|SC update x100000|10|22.725|2.273|44003|
|SC evict x100000|10|47.477|4.748|21062|


## SLRU

https://github.com/velo-org/velo/blob/master/src/caches/slru.ts
|Name|Runs|Total (ms)|Average (ms)|Avg. Operations per ms|
|:--|--:|--:|--:|:--|
|SLRU set x100000|10|125.049|12.505|7996|
|SLRU get x100000|10|53.728|5.373|18612|
|SLRU update x100000|10|27160.404|2716.040|36|
|SLRU evict x100000|10|117.163|11.716|8535|



