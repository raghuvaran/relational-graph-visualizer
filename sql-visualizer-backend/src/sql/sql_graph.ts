import { SQLNode } from './sql_node';

export class SQLGraph<T extends { valueOf: () => string } = SQLNode, V = string[]> {
  nodes: Map<string, T>;
  predecessors: Map<string, Map<string, V>>;
  // TODO: for undirected store all the neighbours under successors
  successors: Map<string, Map<string, V>>;
  isDirected: boolean;

  constructor() {
    this.nodes = new Map();
    this.predecessors = new Map();
    this.successors = new Map();
    this.isDirected = true;
  }

  addNode(node: T) {
    this.nodes.set(node.valueOf(), node);
    return node;
  }

  removeNode(node: T) {
    this.nodes.delete(node.valueOf());
    return true;
  }

  putEdge(from: T, to: T, value: V) {
    this.addPredecessor(to, from, value);
    this.addSuccessor(from, to, value);
  }

  removeEdge(from: T, to: T) {
    this.removePredecessor(to);
    this.removeSuccessor(from);
  }

  addPredecessor(node: T, predecessor: T, value: V) {
    let predecessors = this.predecessors.get(node.valueOf());
    if (!predecessors) {
      predecessors = new Map();
      this.predecessors.set(node.valueOf(), predecessors);
    }
    predecessors.set(predecessor.valueOf(), value);
  }
  addSuccessor(node: T, successor: T, value: V) {
    let successors = this.successors.get(node.valueOf());
    if (!successors) {
      successors = new Map();
      this.successors.set(node.valueOf(), successors);
    }
    successors.set(successor.valueOf(), value);
  }

  removePredecessor(node: T) {
    this.predecessors.delete(node.valueOf());
  }
  removeSuccessor(node: T) {
    this.successors.delete(node.valueOf());
  }

  findNode(value: string) {
    return this.nodes.get(value);
  }

  findOrAddNode(value, node: T) {
    return this.findNode(value) || this.addNode(node);
  }

}