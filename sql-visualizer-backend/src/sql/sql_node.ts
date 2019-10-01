export interface SQLColumn {
  type: string;
  name: string;
}

/**
 * SQL Graph Node
 * @author Nick Hwang
 * @description Graph Node that is used for SQL graph
 */
export class SQLNode<K=string> {
  private columns: SQLColumn[];
  private primaryKeys: string[];

  /**
   * Create a SQLNode
    * @param tableName table name
   * @param columns list of column names
   * @param primaryKeys list of primary key
   */
  constructor(
    private readonly tableName: K,
    columns?: SQLColumn[],
    primaryKeys?: string[],
    foreignKeyMap?: Map<string, string[]>
  ) {
    this.columns = columns || [];
    this.primaryKeys = primaryKeys || [];
  }

  public valueOf(): K {
    return this.tableName;
  }

  public getTableName(): K {
    return this.tableName;
  }

  public getColumns(): SQLColumn[] {
    return this.columns;
  }

  public setColumns(columns: SQLColumn[]): void {
    this.columns = columns;
  }

  public getPrimaryKeys(): string[] {
    return this.primaryKeys;
  }

  public setPrimaryKeys(primaryKeys: string[]): void {
    this.primaryKeys = primaryKeys;
  }
}
