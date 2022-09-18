export function mirrorMap<T>(
  collection: T[],
  toValue: (t: T) => string
): { [key: string]: string } {
  return collection.reduce((p, c) => ({ ...p, [toValue(c)]: toValue(c) }), {});
}

export function mirror(collection: string[]): { [key: string]: string } {
  return mirrorMap(collection, (x) => x);
}