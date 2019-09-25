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
   * @param key table name
   * @param props list of column names
   * @param primaryKey list of primary key
   * @param foreignKeyMap map of table: foreign key mapping.
   */
  constructor(
    private readonly tableName: string,
    private readonly props: SQLProp[],
    private readonly primaryKey: string[],
    private readonly foreignKeyMap: Map<string, string[]>
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
  getPropsForForeignKeyTable(tableName: string): string[] {
    return this.foreignKeyMap.get(tableName);
  }
}
