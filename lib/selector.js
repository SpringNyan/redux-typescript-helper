import { getIn } from "./util";
var createSelector = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var selectors = args.slice(0, args.length - 1);
    var combiner = args[args.length - 1];
    var lastDependencies;
    var lastValue;
    return function (context) {
        var needEvaluate = false;
        var dependencies = selectors.map(function (selector) { return selector(context); });
        if (lastDependencies == null ||
            dependencies.some(function (dep, index) { return dep !== lastDependencies[index]; })) {
            needEvaluate = true;
        }
        lastDependencies = dependencies;
        if (needEvaluate) {
            lastValue = combiner.apply(void 0, dependencies.concat([context]));
        }
        return lastValue;
    };
};
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
                var helper = getIn(dependencies.$storeHelper, namespaces, function (obj, key) { return obj.$child(key); });
                return selectors[key]({
                    state: helper.state,
                    rootState: helper.$root.state,
                    helper: helper,
                    actions: helper.actions,
                    getters: helper.getters,
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
