export var actionTypes = {
    register: "@@REGISTER",
    epicEnd: "@@EPIC_END",
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
