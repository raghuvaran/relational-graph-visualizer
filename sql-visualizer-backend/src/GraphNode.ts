/**
 * SQL Graph Node
 * Authored By Nick Hwang
 */
export class SQLGraphNode {
  /**
   * Create a SQLGraphNode
   * @param key table name
   * @param props list of column names
   */
  constructor(key: string, props: string[]) {
    this.key = key;
    this.props = props;
  }
  private props: string[];
  private key: string;
  getProps(): string[] {
    return this.props;
  }
  getKey(): string {
    return this.key;
  }
}
