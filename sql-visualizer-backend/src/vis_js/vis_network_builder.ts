import { SQLGraph } from '../sql/sql_graph';
import { SQLNode } from '../sql/sql_node';

export class VisNetworkBulider {
  public static toJson(graph: SQLGraph): string {
    const nodes = [...graph.nodes.values()].map((node) => ({
      id: node.getTableName(),
      label: node.getTableName()
    }));
    const edges = [];
    for (const [from] of graph.nodes.entries()) {
      if (!graph.successors.get(from)) continue;
      for (const [to, value] of graph.successors.get(from).entries()) {
        edges.push({
          from,
          to,
          label: value.join(', ')
        });
      }
    }

    return JSON.stringify({ nodes, edges }, null, 2);
  }
}