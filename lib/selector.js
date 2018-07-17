import { getSubObject } from "./util";
export function createModelGetters(model, namespaces, getState, dependencies) {
    return new Proxy({}, {
        get: function (_target, key) {
            if (key in model.selectors) {
                var state = getSubObject(getState(), namespaces);
                return model.selectors[key](state, dependencies);
            }
            else if (key in model.models) {
                return createModelGetters(model.models[key], namespaces.concat([key]), getState, dependencies);
            }
            else {
                return undefined;
            }
        }
    });
}
