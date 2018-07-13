export function getSubObject<T>(
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
