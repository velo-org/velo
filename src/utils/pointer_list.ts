import { getTypedArray, TypedArray } from "./typed_array.ts";

/**
 * Implements a fixed size double-linked list of reference pointers. This
 * implementation relies on a custom pointer system [1]. Utilizing TypedArrays
 * for better engine optimization.
 *
 * The list internally relies on an incrementing index. To not destroy the index
 * based structure use the `newPointer()` method to create a index that can be
 * safely inserted.
 *
 *     const list = new PointerList(10);
 *     const p = list.newPointer();
 *     list.pushFront(p);
 *
 * - [1] https://yomguithereal.github.io/posts/lru-cache#a-custom-pointer-system
 */
export class PointerList {
  /** The capacity of the list */
  readonly capacity: number;

  /** Index of the root */
  private _root = 0;

  /** The size*/
  private _size = 0;

  /** Keeps track of the freed indices */
  private nextIndex: Array<number> = [];

  private next: TypedArray;
  private prev: TypedArray;

  /**
   * Creates an instance of PointerList
   * @param capacity The fixed maximum size of the list
   */
  constructor(capacity: number) {
    this.capacity = capacity;
    this.next = getTypedArray(this.capacity);
    this.prev = getTypedArray(this.capacity);
  }

  /** The first element of the list */
  get front() {
    return this._root;
  }

  /** The last element of the list */
  get back() {
    return this.prev[this._root];
  }

  /** The size of the list */
  get size() {
    return this._size;
  }

  /**
   * Inserts a pointer after a given reference pointer into the list if it is
   * not full.
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
   * Convenience method to move a pointer to the front
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
   * Convenience method to move a pointer to the back
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
   * Removes a pointer from the list
   *
   * @param pointer The pointer to remove
   * @returns The removed pointer
   */
  remove(pointer: number): number {
    if (pointer === this._root) {
      this._root = this.next[this._root];
    }

    if (this._size >= this.capacity) {
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
    this.next = getTypedArray(this.capacity);
    this.prev = getTypedArray(this.capacity);
    this.nextIndex = [];
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
    return this._size >= this.capacity;
  }

  /**
   * Method to create a save pointer to be inserted into the list. This new pointer
   * is not stored in the list. Use {@link insert} to do that.
   *
   * @returns A new pointer or undefined if the list is full
   */
  newPointer(): number {
    const hasFreeIndex = this.nextIndex.length > 0;

    if (hasFreeIndex) {
      return this.nextIndex.shift()!;
    }

    if (this.isFull()) {
      throw new Error("no valid pointer available");
    }

    return this._size;
  }
}
