import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { Key } from '../models/key.ts';
import { PointerList } from '../utils/pointerList.ts';

export class ARC<V = any> extends BaseCache {
  private size: number = 0;
  private values: Array<V>;
  private items: { [key in Key]: number } = {};
  private partition: number;
  private t1: PointerList;
  private t2: PointerList;
  private b1: PointerList;
  private b2: PointerList;

  constructor(options: Options) {
    super(options);
    this.partition = this.capacity / 2;
    this.values = new Array<V>(this.capacity);
    this.t1 = new PointerList(this.capacity);
    this.t2 = new PointerList(this.capacity);
    this.b1 = new PointerList(this.capacity);
    this.b2 = new PointerList(this.capacity);
  }
}
