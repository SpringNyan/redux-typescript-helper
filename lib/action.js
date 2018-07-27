export var actionTypes = {
    register: "@@REGISTER",
    cancel: "@@CANCEL",
    unregister: "@@UNREGISTER"
};
function isAction(action) {
    return action != null && action.type === this.type;
}
export function createActionHelper(type) {
    var actionHelper = (function (payload) { return ({
        type: type,
        payload: payload
    }); });
    actionHelper.type = type;
    actionHelper.is = isAction;
    return actionHelper;
}
export function createModelActionHelpers(model, namespaces) {
    var actions = {};
    for (var _i = 0, _a = Object.keys(model.reducers).concat(Object.keys(model.effects)); _i < _a.length; _i++) {
        var key = _a[_i];
        actions[key] = createActionHelper(namespaces.concat([key]).join("/"));
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        actions[key] = createModelActionHelpers(model.models[key], namespaces.concat([
            key
        ]));
    }
    return actions;
}
