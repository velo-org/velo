import { TypedArray, getTypedArray } from './typedArray.ts';

export class PointerList {
  private _size = 0;
  private next: TypedArray;
  private prev: TypedArray;
  readonly capacity: number;
  readonly root = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.next = getTypedArray(capacity);
    this.prev = getTypedArray(capacity);
  }

  get size() {
    return this._size;
  }

  get front() {
    return this.next[this.root];
  }

  get back() {
    return this.prev[this.root];
  }

  pushFront(pointer: number) {
    this.insert(pointer, this.root);
  }

  pushBack(pointer: number) {
    this.insert(pointer, this.prev[this.root]);
  }

  insert(pointer: number, after: number) {
    const n = this.next[after];
    this.next[after] = pointer;
    this.prev[pointer] = after;
    this.next[pointer] = n;
    this.prev[n] = pointer;
    this._size++;
  }

  moveToFront(pointer: number) {
    this.move(pointer, this.root);
  }

  moveToBack(pointer: number) {
    this.move(pointer, this.prev[this.root]);
  }

  move(pointer: number, after: number) {
    if (pointer == after) return;

    this.next[this.prev[pointer]] = this.next[pointer];
    this.prev[this.next[pointer]] = this.prev[pointer];

    const n = this.next[after];
    this.next[after] = pointer;
    this.prev[pointer] = after;
    this.next[pointer] = n;
    this.prev[n] = pointer;
  }

  removeFront() {
    this.remove(this.root);
  }

  removeBack() {
    this.remove(this.prev[this.root]);
  }

  remove(pointer: number) {
    this.next[this.prev[pointer]] = this.next[pointer];
    this.prev[this.next[pointer]] = this.prev[pointer];
    this._size--;
  }

  clear() {
    this._size = 0;
    this.next = getTypedArray(this.capacity);
    this.prev = getTypedArray(this.capacity);
  }

  nextPointer(pointer: number) {
    return this.next[pointer] !== this.root ? this.next[pointer] : undefined;
  }
}
