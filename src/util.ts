export function getSubObject<T>(obj: any, namespaces: string[]): T {
  return namespaces.reduce(
    (o, namespace) => (o != null ? o[namespace] : undefined),
    obj
  );
}
