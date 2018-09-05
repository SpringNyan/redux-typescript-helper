export function getIn<T>(
  obj: T,
  paths: string[],
  map?: (obj: T, path: string) => T
): T | undefined {
  return paths.reduce<T | undefined>(
    (o, path) =>
      o != null ? (map ? map(o, path) : (o as any)[path]) : undefined,
    obj
  );
}

export function startsWith(str: string, test: string): boolean {
  if (str.startsWith) {
    return str.startsWith(test);
  } else {
    return str.lastIndexOf(test, 0) === 0;
  }
}

export function endsWith(str: string, test: string): boolean {
  if (str.endsWith) {
    return str.endsWith(test);
  } else {
    const offset = str.length - test.length;
    return offset >= 0 && str.lastIndexOf(test, offset) === offset;
  }
}
