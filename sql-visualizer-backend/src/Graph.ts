import { Connection } from 'typeorm';
import { SQLGraphNode, SQLProp } from './GraphNode';
import { Queue } from './Queue';

interface TableConstraintMapping {
  primary: string[];
  foreign: string[];
  tableName: string;
  mapping: Map<string, Map<string, string>>;
}

interface QueryParam {
  [key: string]: string;
}

/**
 * SQL Graph
 * @author Nick Hwang
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

  private async getTableProps(tableName: string): Promise<SQLProp[]> {
    const columnNames = await this.connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME=$1;`,
      [tableName]
    );
    return columnNames.map((column) => ({
      name: column.column_name,
      type: column.data_type
    }));
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

  /**
   * Given
   * @param tableName tableName
   */
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
    const constraintMap: TableConstraintMapping = {
      tableName: '',
      primary: [],
      foreign: [],
      mapping: new Map<string, Map<string, string>>()
    };
    constraintsFilteredByForeignAndPrimary.forEach((constraint) => {
      // it will be sth like "foreign key (key) references object (key)";
      if (constraint.details.indexOf('FOREIGN') !== -1) {
        // First parse using parenthesis and
        // then parse again with space if it is reference
        // It will always be
        // 0: FOREIGN KEY
        // 1: a, b, c
        // 2: REFERENCES table
        // 3: x, y, z
        // 4:
        // TODO what if it is not in this format?
        const detailsParsedWithParen = constraint.details.split(/[()]+/);
        const foreignTable = detailsParsedWithParen[2].split(' ')[2];
        const foreignKeys = detailsParsedWithParen[1]
          .split(/[,\s]+/)
          .map((s: string) => s.trimLeft());
        constraintMap.foreign.push(foreignTable);
        if (!constraintMap.mapping.has(foreignTable)) {
          constraintMap.mapping.set(foreignTable, new Map<string, string>());
        }
        constraintMap.mapping.get(foreignTable).push(...foreignKeys);
      } else {
        constraintMap.tableName = tableName;
        // PRIMARY KEY can contain ASC and DESC
        constraintMap.primary.push(
          ...constraint.details
            .split(/[()]+/)[1]
            .split(',')
            .map((s: string) => s.trimLeft().split(' ')[0])
        );
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
        new SQLGraphNode(
          tableName,
          await this.getTableProps(tableName),
          constraintMap.primary,
          constraintMap.mapping
        )
      );
      console.log({ tableName, mapping: constraintMap.mapping });
    }
    this.buildGraph(mapping);
    // console.log(this.graph);
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
        const edgeKey = `${u},${v.getTableName()}`;
        const reverseEdgeKey = `${v.getTableName()},${u}`;
        if (!visited.has(edgeKey) && !visited.has(reverseEdgeKey)) {
          edges.push({
            from: u,
            to: v.getTableName(),
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
        this.graph.get(v.getTableName()).add(this.nodeMapper.get(key));
      }
    }
  }
  buildGraph(mapping: TableConstraintMapping[]): void {
    mapping.forEach((mapped) => {
      this.graph.set(
        mapped.tableName,
        new Set(mapped.foreign.map((fKey) => this.nodeMapper.get(fKey)))
      );
    });
    this.connectEdges();
  }

  /**
   * traverse using bfs
   * @param tableName tableName to Start
   */
  async traverse(tableName: string, queryParams: QueryParam[]) {
    // tslint:disable-next-line:no-any
    const queue = new Queue<{ tableName: string; obj: any }>();
    const objs = await this.getRowsFromTableQuery(tableName, queryParams);
    // tslint:disable-next-line:no-any
    const visitedMapping = new Map<string, any>();
    // For each node, we would like to make a graph relationship
    objs.forEach((obj) => {
      // bfs
      queue.add({
        tableName,
        obj
      });
      visitedMapping.set(tableName, obj);
      // while (!queue.isEmpty()) {
      //   const size = queue.size();
      //   for (let i = 0; i < size; i += 1) {
      //     const node = queue.remove();
      //     this.graph.get(node.tableName).forEach((neighbor: SQLGraphNode) => {
      //       const queryRes = this.getRowsFromTableQuery(
      //         neighbor.getTableName()
      //       );
      //       const key = this.buildUniqueKey(neighbor);
      //     });
      //   }
      // }
    });
  }

  /**
   * Create a unique key given node and a object that is retrieved from query
   * @param node SQLNode of that table
   * @param obj object returned from query
   */
  // tslint:disable-next-line:no-any
  private buildUniqueKey(node: SQLGraphNode, obj: any): string {
    let key = `${node.getTableName()}`;
    node.getPrimaryKey().forEach((pk: string) => {
      key += `${obj[pk]},`;
    });
    return key;
  }

  /**
   * Retrieve the rows that belong to given query
   * @param tableName tableName
   * @param queryParams
   */
  private async getRowsFromTableQuery(
    tableName: string,
    queryParams: { [key: string]: string }[]
    // tslint:disable-next-line:no-any
  ): Promise<any[]> {
    const builder = this.connection
      .createQueryBuilder()
      .from(tableName, tableName);
    queryParams.forEach((val) => {
      // convert key: value pair to array [key, value]
      const entry = Object.entries(val)[0];
      // TODO we want some parameterized query on column name, but not supported by the driver
      builder.andWhere(`${entry[0]}=:param`, { param: entry[1] });
    });
    const data = await builder.getRawMany();
    return data;
  }

  // tslint:disable-next-line:no-any
  // private buildQueryParamsForForeignKey(
  //   node: SQLGraphNode,
  //   parentObj: any
  // ): QueryParam[] {
  //   const params: QueryParam[] = [];
  //   node.getPropsForForeignKeyTable();
  // }
}
