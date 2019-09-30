export interface SQLProp {
  type: string;
  prop: string;
}

/**
 * SQL Graph Node
 * @author Nick Hwang
 * @description Graph Node that is used for SQL graph
 */
export class SQLGraphNode {
  /**
   * Create a SQLGraphNode
   * @param tableName table name
   * @param props list of column names with their types
   * @param primaryKey list of primary key
   * @param foreignKeyMap map of table: foreign key mapping.
   */
  constructor(
    private readonly tableName: string,
    private readonly props: SQLProp[],
    private readonly primaryKey: string[],
    private readonly foreignKeyMap: Map<string, Map<string, string>>
  ) {}

  getProps(): SQLProp[] {
    return this.props;
  }
  getTableName(): string {
    return this.tableName;
  }
  getPrimaryKey(): string[] {
    return this.primaryKey;
  }
  getPropsForForeignKeyTable(tableName: string): Map<string, string> {
    const foreignKeys = this.foreignKeyMap.get(tableName);
    return foreignKeys ? foreignKeys : undefined;
  }
}
