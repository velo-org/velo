import { TypedArray, getTypedArray } from './typedArray.ts';

/**
 * Implements a fixed size doubly linked list. This implementation relies on a
 * custom pointer system utilizing TypedArrays.
 *
 * Reference: https://yomguithereal.github.io/posts/lru-cache#a-custom-pointer-system
 *
 * To simplify the internals the list is implemented as a ring with
 * the zero index as root element. This allows for easy access to the front
 * and back elements of the list.
 *
 * The list will allow pushing any non-root values if it is not full. To not
 * destroy the index based structure use the newPointer() method.
 *
 *     const list = new PointerList(10);
 *     const pointer = list.newPointer();
 *     list.pushFront(pointer);
 */
export class PointerList {
  /** Index of the root */
  readonly root = 0;

  /** Internal actual capacity (including the root) */
  private readonly _capacity: number;

  /** Internal actual size (including the root, therefore initialized with 1)*/
  private _size = 1;

  /** Keeps track of the freed indices */
  private nextIndex: Array<number> = [];

  private next: TypedArray;
  private prev: TypedArray;

  /**
   * Creates an instance of PointerList
   * @param capacity The fixed size of the list / amount of pointers
   */
  constructor(capacity: number) {
    this._capacity = capacity + 1;
    this.next = getTypedArray(this._capacity);
    this.prev = getTypedArray(this._capacity);
  }

  /**
   * The capacity of the list (exluding the root)
   */
  get capacity() {
    return this._capacity - 1;
  }

  /** The first element of the list */
  get front() {
    return this.next[this.root];
  }

  /** The last element of the list */
  get back() {
    return this.prev[this.root];
  }

  /**
   * @param [withRoot=false] True if the root element should be included
   * @returns The size of the list
   */
  size(withRoot: boolean = false) {
    return this._size - (withRoot ? 0 : 1);
  }

  /**
   * Inserts a pointer after a given reference pointer into the list
   *
   * @param pointer The pointer to be inserted
   * @param after The reference pointer in the list
   */
  insert(pointer: number, after: number) {
    if (pointer === this.root || this.isFull()) return;

    const n = this.next[after];
    this.next[after] = pointer;
    this.prev[pointer] = after;
    this.next[pointer] = n;
    this.prev[n] = pointer;
    this._size++;
  }

  /**
   * Convinience wrapper for inserting a pointer as front element
   *
   * @param pointer The pointer to be inserted
   */
  pushFront(pointer: number) {
    return this.insert(pointer, this.root);
  }

  /**
   * Convinience wrapper for inserting a pointer as back element
   *
   * @param pointer The pointer to be inserted
   */
  pushBack(pointer: number) {
    return this.insert(pointer, this.prev[this.root]);
  }

  /**
   * Moves a given pointer to the position after a reference pointer in the list
   *
   * @param pointer The pointer to move
   * @param after The reference pointer in the list
   */
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

  /**
   * Convenience wrapper to move a pointer to the front
   *
   * @param pointer The pointer to move
   */
  moveToFront(pointer: number) {
    this.move(pointer, this.root);
  }

  /**
   * Convenience wrapper to move a pointer to the back
   *
   * @param pointer The pointer to move
   */
  moveToBack(pointer: number) {
    this.move(pointer, this.prev[this.root]);
  }

  /**
   * Removes a non-root pointer from the list
   *
   * @param pointer The pointer to remove
   * @returns The removed pointer or undefined if root
   */
  remove(pointer: number): number | undefined {
    if (pointer === this.root) return;

    if (this._size >= this._capacity) {
      this.nextIndex.push(pointer);
    }

    this.next[this.prev[pointer]] = this.next[pointer];
    this.prev[this.next[pointer]] = this.prev[pointer];
    this._size--;
    return pointer;
  }

  /**
   * Convenience wrapper to remove the front pointer
   *
   * @param pointer The pointer to remove
   * @returns The removed pointer
   */
  removeFront(): number {
    return this.remove(this.root)!;
  }

  /**
   * Convenience wrapper to remove the back pointer
   *
   * @param pointer The pointer to remove
   * @returns The removed pointer
   */
  removeBack(): number {
    return this.remove(this.prev[this.root])!;
  }

  /**
   * Clears the list
   */
  clear() {
    this._size = 0;
    this.next = getTypedArray(this._capacity);
    this.prev = getTypedArray(this._capacity);
  }

  /**
   * Returns the the next element of a given reference pointer.
   * If the next element would be root undefined is returned.
   *
   * @param pointer The reference pointer
   */
  nextOf(pointer: number) {
    return this.next[pointer] !== this.root ? this.next[pointer] : undefined;
  }

  /**
   * Returns the the previous element of a given reference pointer.
   * If the previous element would be root undefined is returned.
   *
   * @param pointer The reference pointer
   */
  prevOf(pointer: number) {
    return this.prev[pointer] !== this.root ? this.prev[pointer] : undefined;
  }

  /**
   * True if size >= capacity
   */
  isFull() {
    return this._size >= this._capacity;
  }

  /** Returns a save pointer to be inserted */
  newPointer() {
    return this.nextIndex.length > 0 ? this.nextIndex.shift()! : this._size;
  }
}
