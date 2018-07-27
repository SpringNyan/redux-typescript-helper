import { getSubObject } from "./util";
export function createModelGetters(model, getState, dependencies, namespaces, rootGetters) {
    if (rootGetters == null && namespaces.length > 0) {
        throw new Error("rootGetters is required for creating sub model getters");
    }
    var getters = {};
    if (rootGetters == null) {
        rootGetters = getters;
    }
    var _loop_1 = function (key) {
        Object.defineProperty(getters, key, {
            get: function () {
                var rootState = getState();
                var state = getSubObject(rootState, namespaces);
                return model.selectors[key]({
                    state: state,
                    rootState: rootState,
                    getters: getters,
                    rootGetters: rootGetters,
                    dependencies: dependencies
                });
            }
        });
    };
    for (var _i = 0, _a = Object.keys(model.selectors); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_1(key);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        getters[key] = createModelGetters(model.models[key], getState, dependencies, namespaces.concat([key]), rootGetters);
    }
    return getters;
}
