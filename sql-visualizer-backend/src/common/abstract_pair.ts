export abstract class AbstractPair<T> {
  u: T;
  v: T;
  constructor(u, v) {
    this.u = u;
    this.v = v;
  }
  abstract equals(otherPair: AbstractPair<T>): boolean;
}
