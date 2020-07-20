import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { Node, DoublyLinkedList } from '../utils/doublyLinkedList.ts';
import { Key } from '../models/key.ts';
/**
 * https://en.wikipedia.org/wiki/Cache_replacement_policies#Least-frequently_used_(LFU)
 *
 * Counts how often an item is needed. Those that are used least often are discarded first.
 *
 * @example
 *
 * ```ts
 * import {LFU} from "https://deno.land/x/velo/mod.ts"
 *
 * const lfuc = new LFU({ capacity: 5 }); // inits a Least frequently used Cache with a max of 5 key-value pairs
 * lfuc.set(1, { hello: 'asdf' }); //sets 1
 * lfuc.set('2', { hello: 'asdf' }); // sets 2
 * lfuc.set('3', { hello: 'asdf' }); // sets 3
 * lfuc.set('4', { hello: 'asdf' }); // sets 4
 * lfuc.set('5', { hello: 'asdf' }); // sets 5
 *
 * lfuc.get('2'); // gets 2 and increment frequency
 *
 * lfuc.set('6', { hello: 'asdfdd' }); // removes 1 sets 6
 * lfuc.set('7', { hello: 'asdfdd' }); // removes 3 sets 7
 * lfuc.set(8, { hello: 'asdfdd' }); // removes 4 sets 8
 * ```
 *
 */
export class LFU<V = any> extends BaseCache {
  keys: { [key in Key]: Node<V> };
  frequency: { [key: number]: DoublyLinkedList };
  size: number;
  minFrequency: number;

  constructor(options: Options) {
    super(options);
    this.keys = {};
    this.frequency = {};
    this.size = 0;
    this.minFrequency = 1;
  }

  /**
   * Sets a Value with the corresponding Key
   *
   * @param {Key} key - the key for which the value gets stored
   * @param {V} value - the value that has to be stored
   */
  set(key: Key, value: V) {
    let node = this.keys[key];

    // if node doesnt exist in keys then add it
    if (node == undefined) {
      // create new node and store in keys
      node = new Node(key, value);
      this.keys[key] = node;

      // if we have space for node then try to add it to linked list with frequency 1
      if (this.size !== this.capacity) {
        // if linked list for frequency 1 doesnt exist then create it
        if (this.frequency[1] == undefined)
          this.frequency[1] = new DoublyLinkedList();

        // add new node and increment size of frequency 1
        this.frequency[1].insertAtHead(node);
        this.size++;
      } else {
        // else frequency 1 is full and we need to delete a node first so delete tail
        const oldTail = this.frequency[this.minFrequency].removeAtTail();
        delete this.keys[oldTail!.key];

        // if we deleted frequency 1 then add it back before adding new node
        if (this.frequency[1] === undefined)
          this.frequency[1] = new DoublyLinkedList();

        this.frequency[1].insertAtHead(node);
      }

      // we added a new node so minFrequency needs to be reset to 1
      // aka new node was referenced once
      this.minFrequency = 1;
    } else {
      // else node exists so we need to get it and move it to the new linked list

      // save the old frequency of the node and increment (also update data)
      const oldFrequencyCount = node.frequencyCount;
      node.data = value;
      node.frequencyCount++;

      // remove node from the linked list
      this.frequency[oldFrequencyCount].removeNode(node);

      // if new list doesnt exist then make it now
      if (this.frequency[node.frequencyCount] === undefined)
        this.frequency[node.frequencyCount] = new DoublyLinkedList();

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
   * Returns the value for a Key or undefined if the key was not found
   *
   * @param {Key} key - the Key for which you want a value
   */
  get(key: Key) {
    const node = this.keys[key];
    if (node == undefined) return null;

    const oldFrequencyCount = node.frequencyCount;
    node.frequencyCount++;

    // remove node from old frequency list and create new one if next one doesnt exist
    // before adding the node to the next list at the head
    this.frequency[oldFrequencyCount].removeNode(node);
    if (this.frequency[node.frequencyCount] === undefined)
      this.frequency[node.frequencyCount] = new DoublyLinkedList();

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
   *  add array like forEach to the cache Object
   *
   * @param {(item: { key: Key; value: V }, index: number) => void} callback - method which gets called forEach Iteration
   */
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this.keys).forEach((val, i) => {
      callback.call(this, { key: val, value: this.keys[val].data }, i);
    });
  }

  /**
   *  removes the specific entry
   *
   * @param {Key} key - the Key which you want to remove
   */
  remove(key: Key) {
    const node = this.keys[key];
    if (!node) throw new Error('key not found');
    else {
      const oldFrequencyCount = node.frequencyCount;
      this.frequency[oldFrequencyCount].removeNode(node);
      delete this.keys[key];
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
   *  getter for the Values stored in the cache
   *
   * @readonly
   */
  get Values() {
    return Object.keys(this.keys).map((k) => this.keys[k].data);
  }

  /**
   *  getter for the Keys stored in the Cache
   *
   * @readonly
   */
  get Keys() {
    return Object.keys(this.keys);
  }

  /**
   * getter for the current size of the cache
   *
   * @readonly
   */
  get Size() {
    return this.size;
  }

  /**
   * Returns the value for the given Key or undefined if the key was not found but the order does not change
   *
   * @param {Key} key - the Key for which you want a value
   */
  peek(key: Key) {
    const node = this.keys[key];
    if (node == undefined) return null;
    return node;
  }

  /**
   * Checks if the Key is already in the cache
   *
   * @param {Key} key - the Key which you want to check
   */
  has(key: Key) {
    return this.keys[key] ? true : false;
  }
  /**
   * Resets the cache
   *
   */
  clear() {
    this.keys = {};
    this.frequency = {};
    this.size = 0;
    this.minFrequency = 1;
  }
}
