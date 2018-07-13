export var actionTypes = {
    register: "@@REGISTER",
    unregister: "@@UNREGISTER"
};
function createActionHelper(type) {
    var helper = (function (payload) { return ({
        type: type,
        payload: payload
    }); });
    helper.type = type;
    helper.is = function (action) {
        return action.type === type;
    };
    return helper;
}
export function createModelActionHelpers(model, namespaces) {
    return new Proxy({}, {
        get: function (_target, key) {
            if (key in model.reducers || key in model.effects) {
                return createActionHelper(namespaces.concat([key]).join("/"));
            }
            else if (key in model.models) {
                return createModelActionHelpers(model.models[key], namespaces.concat([
                    key
                ]));
            }
            else {
                return undefined;
            }
        }
    });
}
