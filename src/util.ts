export function getSubObject<T extends { [key: string]: T }>(
  obj: T,
  namespaces: string[]
): T | undefined {
  return namespaces.reduce<T | undefined>(
    (o, namespace) => (o != null ? o[namespace] : undefined),
    obj
  );
}
