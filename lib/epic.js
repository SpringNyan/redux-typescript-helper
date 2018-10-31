import { Observable, merge } from "rxjs";
import { map, filter, mergeMap, catchError, takeUntil, distinctUntilChanged } from "rxjs/operators";
import { ActionsObservable, StateObservable } from "redux-observable";
import { actionTypes, actionDispatchCallback } from "./action";
import { getIn, startsWith, endsWith } from "./util";
export function toActionObservable(asyncEffect) {
    return new Observable(function (subscribe) {
        var dispatch = function (action) {
            subscribe.next(action);
            return action;
        };
        asyncEffect(dispatch).then(function () { return subscribe.complete(); }, function (reason) { return subscribe.error(reason); });
    });
}
export function createModelEpic(model, dependencies, errorHandler, namespaces) {
    return function (rootAction$, rootState$) {
        var namespacePrefix = namespaces.join("/");
        var unregisterSuffix = "/" + actionTypes.unregister;
        var takeUntil$ = rootAction$.pipe(filter(function (action) {
            return typeof action.type === "string" &&
                endsWith(action.type, unregisterSuffix) &&
                startsWith(namespacePrefix, action.type.substring(0, action.type.length - unregisterSuffix.length));
        }));
        return merge.apply(void 0, invokeModelEpics(model, dependencies, rootAction$, rootState$, namespaces).map(function (epic) {
            return errorHandler != null ? epic.pipe(catchError(errorHandler)) : epic;
        })).pipe(takeUntil(takeUntil$));
    };
}
function invokeModelEpics(model, dependencies, rootAction$, rootState$, namespaces) {
    var outputs = [];
    for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
        var key = _a[_i];
        var subModel = model.models[key];
        var subOutputs = invokeModelEpics(subModel, dependencies, rootAction$, rootState$, namespaces.concat([key]));
        outputs.push.apply(outputs, subOutputs);
    }
    var state$ = new StateObservable(rootState$.pipe(map(function (state) { return getIn(state, namespaces); }), distinctUntilChanged()), getIn(rootState$.value, namespaces));
    var helper = getIn(dependencies.$storeHelper, namespaces, function (obj, key) { return obj.$child(key); });
    var actions = helper.actions;
    var getters = helper.getters;
    var _loop_1 = function (key) {
        var effect = model.effects[key];
        var action$ = rootAction$.ofType(namespaces.concat([key]).join("/"));
        var output$ = action$.pipe(mergeMap(function (action) {
            actionDispatchCallback.setDispatched(action);
            var payload = action.payload;
            var asyncEffect = effect({
                action$: action$,
                rootAction$: rootAction$,
                state$: state$,
                rootState$: rootState$,
                helper: helper,
                actions: actions,
                getters: getters,
                dependencies: dependencies
            }, payload);
            var wrappedAsyncEffect = function (dispatch) {
                var promise = asyncEffect(dispatch);
                promise.then(function () {
                    actionDispatchCallback.resolve(action);
                }, function (err) {
                    actionDispatchCallback.reject(action, err);
                });
                return promise;
            };
            return toActionObservable(wrappedAsyncEffect);
        }));
        outputs.push(output$);
    };
    for (var _b = 0, _c = Object.keys(model.effects); _b < _c.length; _b++) {
        var key = _c[_b];
        _loop_1(key);
    }
    var namespacePrefix = namespaces.join("/") + "/";
    for (var _d = 0, _e = model.epics; _d < _e.length; _d++) {
        var epic = _e[_d];
        var action$ = new ActionsObservable(rootAction$.pipe(filter(function (action) {
            return typeof action.type === "string" &&
                startsWith(action.type, namespacePrefix);
        })));
        var output$ = epic({
            action$: action$,
            rootAction$: rootAction$,
            state$: state$,
            rootState$: rootState$,
            helper: helper,
            actions: actions,
            getters: getters,
            dependencies: dependencies
        });
        outputs.push(output$);
    }
    return outputs;
}
