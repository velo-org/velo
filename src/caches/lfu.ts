import { BaseCache } from './base.ts';
import { Options } from '../models/options.ts';
import { Node, DoublyLinkedList } from '../utils/doublyLinkedList.ts';
import { Key } from '../models/key.ts';

export class LFUCache<V = any> extends BaseCache {
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

  set(key: Key, value: V) {
    let node = this.keys[key];

    // if node doesnt exist in keys then add it
    if (node == undefined) {
      // create new node and store in keys
      node = new Node(key, value);
      this.keys[key] = node;

      // if we have space for node then try to add it to linked list with frequency 1
      if (this.size !== this.maxCache) {
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
  forEach(callback: (item: { key: Key; value: V }, index: number) => void) {
    Object.keys(this.keys).forEach((val, i) => {
      callback.call(this, { key: val, value: this.keys[val].data }, i);
    });
  }

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

  get Values() {
    return Object.keys(this.keys).map((k) => this.keys[k].data);
  }

  get Keys() {
    return Object.keys(this.keys);
  }

  get Size() {
    return this.size;
  }

  peek(key: Key) {
    const node = this.keys[key];
    if (node == undefined) return null;
    return node;
  }

  has(key: Key) {
    return this.keys[key] ? true : false;
  }

  clear() {
    this.keys = {};
    this.frequency = {};
    this.size = 0;
    this.minFrequency = 1;
  }
}
