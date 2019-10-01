import { SQLNode } from './sql_node';

export class SQLGraph<NodeKey = string, Node extends { valueOf: () => NodeKey } = SQLNode<NodeKey>, EdgeValue = string[]> {
  nodes: Map<NodeKey, Node>;
  predecessors: Map<NodeKey, Map<NodeKey, EdgeValue>>;
  // TODO: for undirected store all the neighbours under successors
  successors: Map<NodeKey, Map<NodeKey, EdgeValue>>;
  directed: boolean;

  constructor() {
    this.nodes = new Map();
    this.predecessors = new Map();
    this.successors = new Map();
    this.directed = true;
  }

  addNode(node: Node) {
    this.nodes.set(node.valueOf(), node);
    return node;
  }

  removeNode(node: Node) {
    this.nodes.delete(node.valueOf());
    return true;
  }

  putEdge(from: Node, to: Node, value: EdgeValue) {
    this.addPredecessor(to, from, value);
    this.addSuccessor(from, to, value);
  }

  removeEdge(from: Node, to: Node) {
    this.removePredecessor(to);
    this.removeSuccessor(from);
  }

  addPredecessor(node: Node, predecessor: Node, value: EdgeValue) {
    let nodePredecessors = this.predecessors.get(node.valueOf());
    if (!nodePredecessors) {
      nodePredecessors = new Map();
      this.predecessors.set(node.valueOf(), nodePredecessors);
    }
    nodePredecessors.set(predecessor.valueOf(), value);
  }
  addSuccessor(node: Node, successor: Node, value: EdgeValue) {
    let nodeSuccessors = this.successors.get(node.valueOf());
    if (!nodeSuccessors) {
      nodeSuccessors = new Map();
      this.successors.set(node.valueOf(), nodeSuccessors);
    }
    nodeSuccessors.set(successor.valueOf(), value);
  }

  removePredecessor(node: Node) {
    this.predecessors.delete(node.valueOf());
  }
  removeSuccessor(node: Node) {
    this.successors.delete(node.valueOf());
  }

  findNode(value: NodeKey) {
    return this.nodes.get(value);
  }

  isDirected() {
    return this.directed;
  }

}