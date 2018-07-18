import produce from "immer";
import { initializeModelState } from "./state";
import { actionTypes } from "./action";
import { getSubObject } from "./util";
export function createModelReducer(model, dependencies) {
    return (function (state, action) {
        state = initializeModelState(state, model, dependencies);
        return produce(state, function (draft) {
            var namespaces = action.type.split("/");
            var stateName = namespaces[namespaces.length - 2];
            var actionType = namespaces[namespaces.length - 1];
            var parentState = getSubObject(draft, namespaces.slice(0, namespaces.length - 2));
            var subModel = getSubObject(model, namespaces.slice(0, namespaces.length - 1), function (o, p) { return o.models[p]; });
            if (actionType === actionTypes.unregister) {
                if (parentState != null) {
                    delete parentState[stateName];
                }
            }
            var subState = parentState != null && stateName != null
                ? parentState[stateName]
                : parentState;
            var subReducer = subModel != null ? subModel.reducers[actionType] : undefined;
            if (subReducer != null) {
                if (subState == null) {
                    throw new Error("Failed to handle action: state must be initialized");
                }
                var nextSubState = subReducer(subState, action.payload, dependencies);
                if (nextSubState !== undefined) {
                    if (stateName != null) {
                        parentState[stateName] = nextSubState;
                    }
                    else {
                        return nextSubState;
                    }
                }
            }
        });
    });
}
