import produce from "immer";
export function initializeModelState(state, model, dependencies) {
    if (state === undefined) {
        if (typeof model.state === "function") {
            state = model.state(dependencies);
        }
        else {
            state = model.state;
        }
    }
    return produce(state, function (draft) {
        for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
            var key = _a[_i];
            var subModel = model.models[key];
            draft[key] = initializeModelState(draft[key], subModel, dependencies);
        }
    });
}
