import { BaseCache } from "./base.ts";
import { Options } from "../models/options.ts";
import { DoublyLinkedList, Node } from "../utils/doublyLinkedList.ts";
import { Key } from "../models/key.ts";

/**
 * Least Frequently Used Cache
 */
export class LFU<V = any> extends BaseCache<V> {
  private _keys: { [key in Key]: Node<V> };
  private frequency: { [key: number]: DoublyLinkedList };
  private _size: number;
  private minFrequency: number;

  constructor(options: Options) {
    super(options);
    this._keys = {};
    this.frequency = {};
    this._size = 0;
    this.minFrequency = 1;
  }

  /**
   * Inserts a new entry into the cache
   *
   * @param key The entries key
   * @param value The entries value
   * @param ttl The max time to live in ms
   */
  set(key: Key, value: V, ttl?: number) {
    this.applyTTL(key, ttl);
    this.applySetEvent(key, value);
    let node = this._keys[key];

    // if node doesnt exist in _keys then add it
    if (node == undefined) {
      this._stats.misses++;
      // create new node and store in _keys
      node = new Node(key, value);
      this._keys[key] = node;

      // if we have space for node then try to add it to linked list with frequency 1
      if (this._size !== this.capacity) {
        // if linked list for frequency 1 doesnt exist then create it
        if (this.frequency[1] == undefined) {
          this.frequency[1] = new DoublyLinkedList();
        }

        // add new node and increment _size of frequency 1
        this.frequency[1].insertAtHead(node);
        this._size++;
      } else {
        // else frequency 1 is full and we need to delete a node first so delete tail
        const oldTail = this.frequency[this.minFrequency].removeAtTail();
        delete this._keys[oldTail!.key];

        // if we deleted frequency 1 then add it back before adding new node
        if (this.frequency[1] === undefined) {
          this.frequency[1] = new DoublyLinkedList();
        }

        this.frequency[1].insertAtHead(node);
      }

      // we added a new node so minFrequency needs to be reset to 1
      // aka new node was referenced once
      this.minFrequency = 1;
    } else {
      this._stats.hits++;
      // else node exists so we need to get it and move it to the new linked list

      // save the old frequency of the node and increment (also update data)
      const oldFrequencyCount = node.frequencyCount;
      node.data = value;
      node.frequencyCount++;

      // remove node from the linked list
      this.frequency[oldFrequencyCount].removeNode(node);

      // if new list doesnt exist then make it now
      if (this.frequency[node.frequencyCount] === undefined) {
        this.frequency[node.frequencyCount] = new DoublyLinkedList();
      }

      // now add node to new linked list with the incremented freqCount
      this.frequency[node.frequencyCount].insertAtHead(node);

      // if the node we incremented was in the minFrequency list of all lists
      // and there's nothing left in the old list then we know the new minFrequency
      // for any node in any list is in the next freq so increment that now
      if (
        oldFrequencyCount === this.minFrequency &&
        this.frequency[oldFrequencyCount].size === 0
      ) {
        this.minFrequency++;
        delete this.frequency[oldFrequencyCount];
      }
    }
  }

  /**
   * Gets the value for a given key
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  get(key: Key) {
    const node = this._keys[key];
    if (node == undefined) return undefined;

    const oldFrequencyCount = node.frequencyCount;
    node.frequencyCount++;

    // remove node from old frequency list and create new one if next one doesnt exist
    // before adding the node to the next list at the head
    this.frequency[oldFrequencyCount].removeNode(node);
    if (this.frequency[node.frequencyCount] === undefined) {
      this.frequency[node.frequencyCount] = new DoublyLinkedList();
    }

    this.frequency[node.frequencyCount].insertAtHead(node);

    // if old frequency list is empty then update minFrequency
    if (
      oldFrequencyCount === this.minFrequency &&
      this.frequency[oldFrequencyCount].size === 0
    ) {
      this.minFrequency++;
      delete this.frequency[oldFrequencyCount];
    }

    return node.data;
  }

  /**
   * Array like forEach, iterating over all entries in the cache
   *
   * @param callback function to call on each item
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this._keys).forEach((val, i) => {
      callback.call(this, { key: val, value: this._keys[val].data }, i);
    });
  }

  /**
   * Removes the cache entry with given key
   *
   * @param key The entries key
   */
  remove(key: Key) {
    const node = this._keys[key];
    if (!node) return;
    else {
      this.applyRemoveEvent(key, this._keys[key].data);
      this._size--;
      const oldFrequencyCount = node.frequencyCount;
      this.frequency[oldFrequencyCount].removeNode(node);
      delete this._keys[key];
      if (
        oldFrequencyCount === this.minFrequency &&
        this.frequency[oldFrequencyCount].size === 0
      ) {
        this.minFrequency++;
        delete this.frequency[oldFrequencyCount];
      }
    }
  }

  /**
   * List of values in the cache
   */
  get values() {
    return Object.keys(this._keys).map((k) => this._keys[k].data);
  }

  /**
   * List of keys in the cache
   */
  get keys() {
    return Object.keys(this._keys);
  }

  /**
   * Current number of entries in the cache
   */
  get size() {
    return this._size;
  }

  /**
   * Get the value to a key __without__ manipulating the cache
   *
   * @param key The entries key
   * @returns The element with given key or undefined if the key is unknown
   */
  peek(key: Key) {
    const node = this._keys[key];
    if (node == undefined) return undefined;
    return node.data;
  }

  /**
   * Checks if a given key is in the cache
   *
   * @param key The key to check
   * @returns True if the cache has the key
   */
  has(key: Key) {
    return this._keys[key] !== undefined ? true : false;
  }

  /**
   * Reset the cache
   */
  clear() {
    this._keys = {};
    this.frequency = {};
    this._size = 0;
    this.minFrequency = 1;
    this.applyClearEvent();
  }
}
