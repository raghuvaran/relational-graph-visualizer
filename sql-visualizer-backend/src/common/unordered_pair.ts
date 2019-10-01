import { AbstractPair } from './abstract_pair';

export class UnorderedPair<T> extends AbstractPair<T> {
  equals(otherPair: AbstractPair<T>): boolean {
    return (this.u === otherPair.u && this.v === otherPair.v) ||
      (this.u === otherPair.v && this.v === otherPair.u);
  }
}