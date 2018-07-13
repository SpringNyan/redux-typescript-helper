export function getSubObject(obj, paths, map) {
    return paths.reduce(function (o, path) {
        return o != null ? (map ? map(o, path) : o[path]) : undefined;
    }, obj);
}
