/**
 * @author Nick Hwang
 * No checking for paramter for now.
 */
export class Queue<T> {
  // tslint:disable-next-line:no-any
  private queue: T[];
  constructor() {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  remove(): T {
    return this.queue.pop();
  }

  add(element: T): void {
    this.queue.unshift(element);
  }

  peek(): T {
    return this.queue[this.queue.length - 1];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
