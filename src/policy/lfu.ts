import { Key } from "../cache/key.ts";
import { DoublyLinkedList, Node } from "../utils/doubly_linked_list.ts";
import { Policy } from "./policy.ts";

/**
 * Least Frequently Used (LFU)
 */
export class Lfu<K extends Key, V> implements Policy<K, V> {
  private _keys: { [key in Key]: Node<V> };
  private frequency: { [key: number]: DoublyLinkedList<V> };
  private _size: number;
  private minFrequency: number;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this._keys = {};
    this.frequency = {};
    this._size = 0;
    this.minFrequency = 1;
  }

  set(key: K, value: V) {
    let node = this._keys[key];

    // if node doesnt exist in _keys then add it
    if (node == undefined) {
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

  get(key: K) {
    const node = this._keys[key];
    if (node == undefined) {
      return undefined;
    }

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

  forEach(callback: (item: { key: K; value: V }, index: number) => void) {
    this.keys.forEach((val, i) => {
      callback.call(this, { key: val, value: this._keys[val].data as V }, i);
    });
  }

  remove(key: K) {
    const node = this._keys[key];
    if (!node) return;
    else {
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

  get values() {
    return this.keys.map((k) => this._keys[k].data) as V[];
  }

  get keys() {
    return Object.keys(this._keys) as K[];
  }

  get size() {
    return this._size;
  }

  peek(key: K) {
    const node = this._keys[key];
    if (node == undefined) return undefined;
    return node.data;
  }

  has(key: K) {
    return this._keys[key] !== undefined ? true : false;
  }

  clear() {
    this._keys = {};
    this.frequency = {};
    this._size = 0;
    this.minFrequency = 1;
  }
}
