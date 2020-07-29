import { TypedArray, getTypedArray } from './typedArray.ts';

/**
 * Implements a fixed size doubly linked list. This implementation relies on a
 * custom pointer system utilizing TypedArrays.
 *
 * Reference: https://yomguithereal.github.io/posts/lru-cache#a-custom-pointer-system
 *
 * To simplify the internals the list is implemented as a ring with
 * a root indicating the first element. This allows for easy access to the front
 * and back elements of the list.
 *
 * The list will allow pushing any values if it is not full. To not
 * destroy the index based structure use the newPointer() method to create a
 * safe index.
 *
 *     const list = new PointerList(10);
 *     const pointer = list.newPointer();
 *     list.pushFront(pointer);
 */
export class PointerList {
  /** Index of the root */
  private _root = 0;

  /** Internal actual capacity (including the _root) */
  private readonly _capacity: number;

  /** Internal actual size (including the _root, therefore initialized with 1)*/
  private _size = 0;

  /** Keeps track of the freed indices */
  private nextIndex: Array<number> = [];

  private next: TypedArray;
  private prev: TypedArray;

  /**
   * Creates an instance of PointerList
   * @param capacity The fixed size of the list / amount of pointers
   */
  constructor(capacity: number) {
    this._capacity = capacity;
    this.next = getTypedArray(this._capacity);
    this.prev = getTypedArray(this._capacity);
  }

  /**
   * The capacity of the list (exluding the _root)
   */
  get capacity() {
    return this._capacity;
  }

  /** The first element of the list */
  get front() {
    return this._root;
  }

  /** The last element of the list */
  get back() {
    return this.prev[this._root];
  }

  /**
   * The size of the list
   */
  get size() {
    return this._size;
  }

  /**
   * Inserts a pointer after a given reference pointer into the list
   *
   * @param pointer The pointer to be inserted
   * @param after The reference pointer in the list
   * @returns True if the pointer was inserted
   */
  insert(pointer: number, after: number): boolean {
    if (this.isFull()) return false;

    const n = this.next[after];
    this.next[after] = pointer;
    this.prev[pointer] = after;
    this.next[pointer] = n;
    this.prev[n] = pointer;
    this._size++;
    return true;
  }

  /**
   * Convinience wrapper for inserting a pointer as front element
   *
   * @param pointer The pointer to be inserted
   * @returns True if the pointer was inserted
   */
  pushFront(pointer: number) {
    const inserted = this.insert(pointer, this.prev[this._root]);
    if (inserted) {
      this._root = pointer;
    }
    return inserted;
  }

  /**
   * Convinience wrapper for inserting a pointer as back element
   *
   * @param pointer The pointer to be inserted
   * @returns True if the pointer was inserted
   */
  pushBack(pointer: number) {
    return this.insert(pointer, this.prev[this._root]);
  }

  /**
   * Moves a given pointer to the position after a reference pointer in the list
   *
   * @param pointer The pointer to move
   * @param after The reference pointer in the list
   */
  move(pointer: number, after: number) {
    if (pointer === after) return;

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
    this.move(pointer, this.prev[this._root]);
    if (pointer !== this._root) {
      this._root = pointer;
    }
  }

  /**
   * Convenience wrapper to move a pointer to the back
   *
   * @param pointer The pointer to move
   */
  moveToBack(pointer: number) {
    this.move(pointer, this.prev[this._root]);
    if (pointer === this._root) {
      this._root = this.next[pointer];
    }
  }

  /**
   * Removes a non-_root pointer from the list
   *
   * @param pointer The pointer to remove
   * @returns The removed pointer
   */
  remove(pointer: number): number {
    if (pointer === this._root) {
      this._root = this.next[this._root];
    }

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
    return this.remove(this._root);
  }

  /**
   * Convenience wrapper to remove the back pointer
   *
   * @param pointer The pointer to remove
   * @returns The removed pointer
   */
  removeBack(): number {
    return this.remove(this.prev[this._root]);
  }

  /**
   * Clears the list
   */
  clear(): void {
    this._root = 0;
    this._size = 0;
    this.next = getTypedArray(this._capacity);
    this.prev = getTypedArray(this._capacity);
  }

  /**
   * Returns the the next element of a given reference pointer.
   * If the next element would be root undefined is returned.
   *
   * @param pointer The reference pointer
   * @returns The next pointer or undefined if it would be the root
   */
  nextOf(pointer: number): number | undefined {
    return this.next[pointer] !== this._root ? this.next[pointer] : undefined;
  }

  /**
   * Returns the the previous element of a given reference pointer.
   * If the previous element would be the element before root undefined is returned.
   *
   * @param pointer The reference pointer
   * @returns the previous pointer or undefined if it would be prev[root]
   */
  prevOf(pointer: number): number | undefined {
    return this.prev[pointer] !== this.prev[this._root]
      ? this.prev[pointer]
      : undefined;
  }

  /**
   * @returns True if size >= capacity
   */
  isFull(): boolean {
    return this._size >= this._capacity;
  }

  /**
   * Method to create a save pointer to be inserted into the list.
   *
   * @returns A new pointer or undefined if the list is full
   */
  newPointer(): number | undefined {
    const hasFreeIndex = this.nextIndex.length > 0;

    if (hasFreeIndex) {
      return this.nextIndex.shift();
    }

    if (!this.isFull()) {
      return this._size;
    }

    return undefined;
  }
}
