export function getIn(obj, paths, map) {
    return paths.reduce(function (o, path) {
        return o != null ? (map ? map(o, path) : o[path]) : undefined;
    }, obj);
}
export function startsWith(str, test) {
    if (str.startsWith) {
        return str.startsWith(test);
    }
    else {
        return str.lastIndexOf(test, 0) === 0;
    }
}
export function endsWith(str, test) {
    if (str.endsWith) {
        return str.endsWith(test);
    }
    else {
        var offset = str.length - test.length;
        return offset >= 0 && str.lastIndexOf(test, offset) === offset;
    }
}
