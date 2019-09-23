import { Connection } from 'typeorm';
import { SQLGraphNode } from './GraphNode';

interface TableConstraintMapping {
  primary: string;
  foreign: string[];
}

/**
 * SQL Graph
 * Authored By Nick Hwang
 * This graph will represents a undirected (will contain both edges) graph of table relationship
 * This is hard-coded for postgres sql, but will see how flexible it will be with other database
 */
export class SQLGraph {
  private graph: Map<string, Set<SQLGraphNode>>;
  private nodeMapper: Map<string, SQLGraphNode>;
  private connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  private async getTableProps(tableName: string): Promise<string[]> {
    const columnNames = await this.connection.query(`SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'user_role';`);
    return columnNames.map((name) => name.column_name);
  }

  private async getTableNames(): Promise<string[]> {
    const keywords = (await this.connection.query(
      'select * from pg_get_keywords()'
    )).filter((keyword) => keyword.catcode === 'R');
    const keywordSet = new Set(keywords.map((keyword) => keyword.word));
    const tableNames = await this.connection.query('show tables');
    return tableNames.map((name) =>
      keywordSet.has(name.table_name) ? `"${name.table_name}"` : name.table_name
    );
  }

  private async getPrimaryAndForeignConstraintsMapping(
    tableName: string
  ): Promise<TableConstraintMapping> {
    const constraints = await this.connection.query(
      `show constraints from ${tableName}`
    );
    const constraintsFilteredByForeignAndPrimary = constraints.filter(
      (constraint) =>
        constraint.constraint_type.indexOf('FOREIGN') !== -1 ||
        constraint.constraint_type.indexOf('PRIMARY') !== -1
    );
    const constraintMap = { primary: '', foreign: [] };
    constraintsFilteredByForeignAndPrimary.forEach((constraint) => {
      // it will be sth like "foreign key (key) references object (key)";
      if (constraint.details.indexOf('FOREIGN') !== -1) {
        constraintMap.foreign.push(constraint.details.split(' ')[4]);
      } else {
        constraintMap.primary = tableName;
      }
    });
    return constraintMap;
  }
  async setup() {
    this.nodeMapper = new Map<string, SQLGraphNode>();
    this.graph = new Map<string, Set<SQLGraphNode>>();
    const tableNames = await this.getTableNames();
    const mapping = [];
    for (const tableName of tableNames) {
      const constraintMap = await this.getPrimaryAndForeignConstraintsMapping(
        tableName
      );
      mapping.push(constraintMap);
      this.nodeMapper.set(
        tableName,
        new SQLGraphNode(tableName, await this.getTableProps(tableName))
      );
    }
    this.buildGraph(mapping);
  }

  buildVisJsTableGraph(): string {
    const nodes = [...this.graph.keys()].map((key) => ({
      id: key,
      label: key
    }));
    const edges = [];
    const visited = new Set<string>();
    for (const u of this.graph.keys()) {
      for (const v of this.graph.get(u).values()) {
        const edgeKey = `${u},${v.getKey()}`;
        const reverseEdgeKey = `${v.getKey()},${u}`;
        if (!visited.has(edgeKey) && !visited.has(reverseEdgeKey)) {
          edges.push({
            from: u,
            to: v.getKey(),
            value: 50
          });
          visited.add(edgeKey);
          visited.add(reverseEdgeKey);
        }
      }
    }

    return JSON.stringify({ nodes, edges }, null, 2);
  }

  private connectEdges(): void {
    for (const key of this.graph.keys()) {
      for (const v of this.graph.get(key).values()) {
        this.graph.get(v.getKey()).add(this.nodeMapper.get(key));
      }
    }
  }
  buildGraph(mapping: TableConstraintMapping[]): void {
    mapping.forEach((mapped) => {
      this.graph.set(
        mapped.primary,
        new Set(mapped.foreign.map((fKey) => this.nodeMapper.get(fKey)))
      );
    });
    this.connectEdges();
  }
}
