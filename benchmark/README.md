# Benchmark Results

```bash
KEYS: 100000
RUNS: 10
OS: win32
CPU: Intel(R) Core(TM) i7-10510U CPU @ 1.80GHz
RAM: 16.330 MB
```

## ARC

https://github.com/velo-org/velo/blob/master/src/caches/arc.ts |Name|Runs|Total
(ms)|Average (ms)|Avg. Operations per ms| |:--|--:|--:|--:|:--| |ARC set
x100000|10|96.739|9.674|10337| |ARC get x100000|10|51.785|5.178|19310| |ARC
update x100000|10|54.324|5.432|18408| |ARC evict x100000|10|215.550|21.555|4639|

## LFU

https://github.com/velo-org/velo/blob/master/src/caches/lfu.ts |Name|Runs|Total
(ms)|Average (ms)|Avg. Operations per ms| |:--|--:|--:|--:|:--| |LFU set
x100000|10|67.726|6.773|14765| |LFU get x100000|10|38.929|3.893|25687| |LFU
update x100000|10|60.407|6.041|16554| |LFU evict x100000|10|145.793|14.579|6859|

## LRU

https://github.com/velo-org/velo/blob/master/src/caches/lru.ts |Name|Runs|Total
(ms)|Average (ms)|Avg. Operations per ms| |:--|--:|--:|--:|:--| |LRU set
x100000|10|48.877|4.888|20459| |LRU get x100000|10|17.592|1.759|56844| |LRU
update x100000|10|31.759|3.176|31487| |LRU evict x100000|10|37.952|3.795|26349|

## RR

https://github.com/velo-org/velo/blob/master/src/caches/rr.ts |Name|Runs|Total
(ms)|Average (ms)|Avg. Operations per ms| |:--|--:|--:|--:|:--| |RR set
x100000|10|38.747|3.875|25808| |RR get x100000|10|10.173|1.017|98294| |RR update
x100000|10|31.069|3.107|32186| |RR evict x100000|10|67.018|6.702|14921|

## SC

https://github.com/velo-org/velo/blob/master/src/caches/sc.ts |Name|Runs|Total
(ms)|Average (ms)|Avg. Operations per ms| |:--|--:|--:|--:|:--| |SC set
x100000|10|56.491|5.649|17701| |SC get x100000|10|14.307|1.431|69895| |SC update
x100000|10|34.523|3.452|28965| |SC evict x100000|10|53.419|5.342|18719|

## SLRU

https://github.com/velo-org/velo/blob/master/src/caches/slru.ts |Name|Runs|Total
(ms)|Average (ms)|Avg. Operations per ms| |:--|--:|--:|--:|:--| |SLRU set
x100000|10|163.865|16.387|6102| |SLRU get x100000|10|69.071|6.907|14477| |SLRU
update x100000|10|77920.209|7792.021|12| |SLRU evict
x100000|10|186.379|18.638|5365|
