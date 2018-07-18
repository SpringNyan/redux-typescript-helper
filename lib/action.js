export var actionTypes = {
    register: "@@REGISTER",
    effectEnd: "@@EFFECT_END",
    unregister: "@@UNREGISTER"
};
var ActionHelper = /** @class */ (function () {
    function ActionHelper(type, dispatch) {
        this.type = type;
        this._dispatch = dispatch;
    }
    ActionHelper.prototype.create = function (payload) {
        return {
            type: this.type,
            payload: payload
        };
    };
    ActionHelper.prototype.dispatch = function (payload) {
        return this._dispatch(this.create(payload));
    };
    ActionHelper.prototype.is = function (action) {
        return action.type === this.type;
    };
    return ActionHelper;
}());
export { ActionHelper };
export function createModelActionHelpers(model, namespaces, dispatch) {
    return new Proxy({}, {
        get: function (_target, key) {
            if (key in model.reducers || key in model.effects) {
                return new ActionHelper(namespaces.concat([key]).join("/"), dispatch);
            }
            else if (key in model.models) {
                return createModelActionHelpers(model.models[key], namespaces.concat([key]), dispatch);
            }
            else {
                return undefined;
            }
        }
    });
}
