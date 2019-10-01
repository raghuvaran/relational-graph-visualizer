export class CustomSet<T> implements Set<T> {
  private map = new Map<any, T>();
  [Symbol.iterator] = this.values;
  [Symbol.toStringTag] = 'CustomSet';

  add(obj: T) {
    this.map.set(obj.valueOf(), obj);
    return this;
  }

  addIfNotExists(obj: T) {
    if (this.map.has(obj)) return;
    return this.add(obj);
  }

  get(lookupKey: any) {
    return this.map.get(lookupKey);
  }

  values() {
    return this.map.values();
  }

  has(obj: T) {
    return this.map.has(obj.valueOf());
  }

  clear() {
    this.map.clear();
  }

  delete(obj: T) {
    const has = this.map.has(obj.valueOf());
    if (has) this.map.delete(obj.valueOf());
    return has;
  }
  entries() {
    return this.map.entries();
  }

  keys() {
    return this.map.values();
  }

  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void) {
    const set = new Set<T>(this.values());
    this.map.forEach((value: T, value2: T, map: Map<any, T>) => {
      callbackfn(value, value2, set);
    });
  }

  get size() {
    return this.map.size;
  }
}