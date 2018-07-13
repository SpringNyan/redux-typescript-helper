import { merge } from "rxjs";
import { map, takeUntil, skip, skipWhile, mergeMap } from "rxjs/operators";
import { ActionsObservable, StateObservable } from "redux-observable";
import { actionTypes } from "./action";
import { getSubObject } from "./util";
export function registerModelEffects(model, namespaces, rootActions, rootAction$, rootState$, dependencies) {
    var outputs = [];
    for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
        var key = _a[_i];
        var subModel = model.models[key];
        var subOutputs = registerModelEffects(subModel, namespaces.concat([key]), rootActions, rootAction$, rootState$, dependencies);
        outputs.push.apply(outputs, subOutputs);
    }
    var takeUntil$ = rootAction$.pipe(skipWhile(function (action) {
        return action.type !== namespaces.join("/") + "/" + actionTypes.unregister;
    }), skip(1));
    rootAction$ = new ActionsObservable(rootAction$.pipe(takeUntil(takeUntil$)));
    rootState$ = new StateObservable(rootState$.pipe(takeUntil(takeUntil$)), rootState$.value);
    var state$ = new StateObservable(rootState$.pipe(map(function (state) { return getSubObject(state, namespaces); })), getSubObject(rootState$.value, namespaces));
    var actions = getSubObject(rootActions, namespaces);
    var _loop_1 = function (key) {
        var effect;
        var operator = mergeMap;
        var effectWithOperator = model.effects[key];
        if (Array.isArray(effectWithOperator)) {
            effect = effectWithOperator[0], operator = effectWithOperator[1];
        }
        else {
            effect = effectWithOperator;
        }
        var action$ = rootAction$.ofType(namespaces.concat([key]).join("/"));
        var output$ = action$.pipe(operator(function (action) {
            var payload = action.payload;
            return effect({
                action$: action$,
                rootAction$: rootAction$,
                state$: state$,
                rootState$: rootState$,
                actions: actions,
                rootActions: rootActions,
                dependencies: dependencies
            }, payload);
        }));
        outputs.push(output$);
    };
    for (var _b = 0, _c = Object.keys(model.effects); _b < _c.length; _b++) {
        var key = _c[_b];
        _loop_1(key);
    }
    return outputs;
}
export function createModelEpic(model, namespaces, actions, dependencies) {
    return function (action$, state$) {
        return merge.apply(void 0, registerModelEffects(model, namespaces, actions, action$, state$, dependencies));
    };
}