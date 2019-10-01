import { AbstractPair } from './abstract_pair';

export class OrderedPair<T> extends AbstractPair<T> {
  equals(otherPair: AbstractPair<T>): boolean {
    return this.u === otherPair.u && this.v === otherPair.v;
  }
}