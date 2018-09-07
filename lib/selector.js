import { createSelector } from "reselect";
import { getIn } from "./util";
export function createModelGetters(model, dependencies, namespaces, parent) {
    var getters = {
        get state() {
            return getIn(dependencies.$store.getState(), namespaces);
        },
        $namespace: namespaces.join("/"),
        $parent: parent
    };
    getters.$root = parent != null ? parent.$root : getters;
    getters.$child = function (namespace) { return getters[namespace]; };
    var selectors = model.selectors(createSelector);
    var _loop_1 = function (key) {
        Object.defineProperty(getters, key, {
            get: function () {
                return selectors[key]({
                    get state() {
                        return getters.state;
                    },
                    get rootState() {
                        return getters.$root.state;
                    },
                    getters: getters,
                    dependencies: dependencies
                });
            },
            enumerable: true,
            configurable: true
        });
    };
    for (var _i = 0, _a = Object.keys(selectors); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_1(key);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        getters[key] = createModelGetters(model.models[key], dependencies, namespaces.concat([key]), getters);
    }
    return getters;
}
