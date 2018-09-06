var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import produce from "immer";
import { actionTypes } from "./action";
import { getIn } from "./util";
export function createModelReducer(model, dependencies) {
    return function (rootState, action) {
        rootState = initializeModelState(rootState, model, dependencies);
        return produce(rootState, function (rootDraft) {
            var namespaces = action.type.split("/");
            var parentState = getIn(rootDraft, namespaces.slice(0, namespaces.length - 2));
            var targetModel = getIn(model, namespaces.slice(0, namespaces.length - 1), function (obj, key) { return obj.models[key]; });
            var stateName = namespaces[namespaces.length - 2];
            var actionType = namespaces[namespaces.length - 1];
            if (actionType === actionTypes.unregister) {
                if (parentState != null && stateName != null) {
                    delete parentState[stateName];
                }
            }
            var targetState = parentState != null && stateName != null
                ? parentState[stateName]
                : undefined;
            var targetReducer = targetModel != null ? targetModel.reducers[actionType] : undefined;
            if (targetReducer != null) {
                if (parentState == null || stateName == null) {
                    throw new Error("state not found");
                }
                var nextTargetState = targetReducer(targetState, action.payload, dependencies);
                if (nextTargetState !== undefined) {
                    parentState[stateName] = nextTargetState;
                }
            }
        });
    };
}
function initializeModelState(state, model, dependencies) {
    if (state === undefined) {
        state = model.state(dependencies);
    }
    var mutated = false;
    var subStates = {};
    for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
        var key = _a[_i];
        var subModel = model.models[key];
        var subState = initializeModelState(state[key], subModel, dependencies);
        if (state[key] !== subState) {
            subStates[key] = subState;
            mutated = true;
        }
    }
    if (mutated) {
        return __assign({}, state, subStates);
    }
    else {
        return state;
    }
}
