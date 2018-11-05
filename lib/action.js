var ActionDispatchCallback = /** @class */ (function () {
    function ActionDispatchCallback() {
        // TODO: es5 fallback
        this._itemMap = new Map();
    }
    ActionDispatchCallback.prototype.setDispatched = function (action) {
        var item = this._itemMap.get(action);
        if (item != null) {
            item.hasDispatched = true;
        }
    };
    ActionDispatchCallback.prototype.hasDispatched = function (action) {
        var item = this._itemMap.get(action);
        if (item != null) {
            return item.hasDispatched;
        }
        return false;
    };
    ActionDispatchCallback.prototype.resolve = function (action) {
        var item = this._itemMap.get(action);
        if (item != null) {
            item.resolve();
            this._itemMap.delete(action);
        }
    };
    ActionDispatchCallback.prototype.reject = function (action, err) {
        var item = this._itemMap.get(action);
        if (item != null) {
            item.reject(err);
            this._itemMap.delete(action);
        }
    };
    ActionDispatchCallback.prototype.register = function (action) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._itemMap.set(action, {
                hasDispatched: false,
                resolve: resolve,
                reject: reject
            });
        });
    };
    return ActionDispatchCallback;
}());
export var actionDispatchCallback = new ActionDispatchCallback();
export var actionTypes = {
    register: "@@REGISTER",
    epicEnd: "@@EPIC_END",
    unregister: "@@UNREGISTER"
};
function isAction(action) {
    return action != null && action.type === this.type;
}
export function createActionHelper(type, defaultDispatch) {
    var actionHelper = (function (payload) { return ({
        type: type,
        payload: payload
    }); });
    actionHelper.type = type;
    actionHelper.is = isAction;
    actionHelper.dispatch = function (payload, dispatch) {
        var action = actionHelper(payload);
        var promise = actionDispatchCallback.register(action);
        (dispatch || defaultDispatch)(action);
        Promise.resolve().then(function () {
            if (!actionDispatchCallback.hasDispatched(action)) {
                actionDispatchCallback.resolve(action);
            }
        });
        return promise;
    };
    return actionHelper;
}
export function createModelActionHelpers(model, dependencies, namespaces, parent) {
    var actions = {
        $namespace: namespaces.join("/"),
        $parent: parent
    };
    actions.$root = parent != null ? parent.$root : actions;
    actions.$child = function (namespace) { return actions[namespace]; };
    var dispatch = function (action) {
        return dependencies.$store.dispatch(action);
    };
    for (var _i = 0, _a = Object.keys(model.reducers).concat(Object.keys(model.effects)); _i < _a.length; _i++) {
        var key = _a[_i];
        actions[key] = createActionHelper(namespaces.concat([key]).join("/"), dispatch);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        actions[key] = createModelActionHelpers(model.models[key], dependencies, namespaces.concat([key]), actions);
    }
    return actions;
}
