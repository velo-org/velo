import { Key } from "../cache/key.ts";

export class DoublyLinkedList<K extends Key, V> {
  head: Node<K, V | undefined>;
  tail: Node<K, V | undefined>;
  size: number;

  constructor() {
    this.head = new Node();
    this.tail = new Node();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  insertAtHead(node: Node<K, V | undefined>) {
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

  removeNode(node: Node<K, V>) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;

    this.size--;
  }
}

export class Node<K extends Key, V> {
  prev: Node<K, V> | undefined;
  next: Node<K, V> | undefined;
  key: K | undefined;
  data: V | undefined;
  frequencyCount: number;

  constructor(key?: K, value?: V) {
    this.prev = undefined;
    this.next = undefined;
    this.key = key;
    this.data = value;
    this.frequencyCount = 1;
  }
}
