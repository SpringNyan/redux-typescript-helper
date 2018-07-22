import { getSubObject } from "./util";
export function createModelGetters(model, namespaces, getState, rootGetters, dependencies) {
    if (rootGetters == null && namespaces.length > 0) {
        throw new Error("rootGetters is required for creating sub model getters");
    }
    var modelGetters = new Proxy({}, {
        get: function (_target, key) {
            if (rootGetters == null) {
                rootGetters = modelGetters;
            }
            if (key in model.selectors) {
                var rootState = getState();
                var state = getSubObject(rootState, namespaces);
                return model.selectors[key]({
                    state: state,
                    rootState: rootState,
                    getters: modelGetters,
                    rootGetters: rootGetters,
                    dependencies: dependencies
                });
            }
            else if (key in model.models) {
                return createModelGetters(model.models[key], namespaces.concat([key]), getState, rootGetters, dependencies);
            }
            else {
                return undefined;
            }
        }
    });
    return modelGetters;
}
