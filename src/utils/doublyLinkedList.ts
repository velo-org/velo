import { Key } from '../models/key.ts';

export class DoublyLinkedList<V = any> {
  head: Node;
  tail: Node;
  size: number;

  constructor() {
    this.head = new Node('head', null);
    this.tail = new Node('tail', null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  insertAtHead(node: Node) {
    // set current head as new node's next
    node.next = this.head.next;
    this.head.next!.prev = node;

    // set current head as new node
    this.head.next = node;
    node.prev = this.head;

    this.size++;
  }

  removeAtTail() {
    const oldTail = this.tail.prev; // save last node to return back

    // get reference to node we want to remove
    const prev = this.tail.prev;

    // from the node we want to remove - get the prev node, then set THAT node's next to tail
    prev!.prev!.next = this.tail;

    // set prev node of the tail to the node previous to the node we want to remove
    this.tail.prev = prev!.prev;

    this.size--;
    return oldTail;
  }

  removeNode(node: Node) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;

    this.size--;
  }
}

export class Node<V = any> {
  prev: Node | null;
  next: Node | null;
  key: Key;
  data: V;
  frequencyCount: number;

  constructor(key: Key, value: V) {
    this.prev = null;
    this.next = null;
    this.key = key;
    this.data = value;
    this.frequencyCount = 1;
  }
}
