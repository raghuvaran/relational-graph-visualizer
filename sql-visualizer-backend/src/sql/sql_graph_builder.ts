import { getConnection } from 'typeorm';
import { SQLGraph } from './sql_graph';
import { SQLNode } from './sql_node';

/**
 * SQL Graph
 * @author Nick Hwang
 * This graph will represents a directed (will contain both edges) graph of table relationship
 * This is hard-coded for postgres sql, but will see how flexible it will be with other database
 */
export class SQLGraphBuilder {
  private graph: SQLGraph<string, SQLNode, string[]> = new SQLGraph();

  async build() {
    const tableNames = await this.getTableNames();
    tableNames.forEach(tableName => this.graph.addNode(new SQLNode(tableName)));
    await Promise.all([
      ...tableNames.map(tableName => this.fillTableConstraints(tableName)),
      ...tableNames.map(tableName => this.fillTableColumns(tableName))
    ]);
    return this.graph;
  }

  private async getTableNames(): Promise<string[]> {
    const keywords = (await getConnection().query(
      'select * from pg_get_keywords()'
    )).filter((keyword) => keyword.catcode === 'R');
    const keywordSet = new Set(keywords.map((keyword) => keyword.word));
    const tableNames = await getConnection().query('show tables');
    return tableNames.map((name) =>
      keywordSet.has(name.table_name) ? `"${name.table_name}"` : name.table_name
    );
  }

  private handleFKConstraint(node: SQLNode, constraint) {
    // it will be sth like "foreign key (key) references object (key)";
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
    const foreignKeys: string[] = detailsParsedWithParen[1]
      .split(/[,\s]+/)
      .map((s: string) => s.trimLeft());

    const foreignNode = this.graph.findNode(foreignTable);
    this.graph.putEdge(node, foreignNode, foreignKeys);
  }

  private handlePKConstraint(node: SQLNode, constraint) {
    // PRIMARY KEY can contain ASC and DESC
    node.setPrimaryKeys(constraint.details
      .split(/[()]+/)[1]
      .split(',')
      .map((s: string) => s.trimLeft().split(' ')[0]));
  }

  private async fillTableColumns(tableName: string) {
    const columnNames = await getConnection()
      .query(`SELECT COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = $1`, [tableName]);
    this.graph.findNode(tableName).setColumns(columnNames.map((column) => ({
      name: column.column_name,
      type: column.data_type
    })));
  }

  /**
   * Fills table constraints into graph/nodes
   * @param tableName tableName
   */
  private async fillTableConstraints(
    tableName: string
  ) {
    const node = this.graph.findNode(tableName);

    const constraints = await getConnection().query(
      `show constraints from ${tableName}`
    );
    constraints.filter(c => c.constraint_type.indexOf('FOREIGN') !== -1).forEach(c => this.handleFKConstraint(node, c));
    constraints.filter(c => c.constraint_type.indexOf('PRIMARY') !== -1).forEach(c => this.handlePKConstraint(node, c));
  }

}
