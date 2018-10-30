import { Observable, merge } from "rxjs";
import { map, filter, mergeMap, catchError, takeUntil, distinctUntilChanged } from "rxjs/operators";
import { ActionsObservable, StateObservable } from "redux-observable";
import { actionTypes } from "./action";
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
function createActionDispatcher(type, dispatch) {
    var dispatcher = (function (payload) {
        var id = dispatcher._nextId;
        dispatcher._nextId += 1;
        // TODO: resolve promise when model is unregistered
        var promise = new Promise(function (resolve, reject) {
            dispatcher._callbackById[id] = {
                resolve: resolve,
                reject: reject
            };
        });
        var cleanup = function () { return delete dispatcher._callbackById[id]; };
        promise.then(cleanup, cleanup);
        dispatch({
            type: type,
            payload: payload,
            __dispatch_id: id
        });
        return promise;
    });
    dispatcher._nextId = 1;
    dispatcher._callbackById = {};
    return dispatcher;
}
export function createModelActionDispatchers(model, dependencies, namespaces, parent) {
    var dispatchers = {
        $namespace: namespaces.join("/"),
        $parent: parent
    };
    dispatchers.$root = parent != null ? parent.$root : dispatchers;
    dispatchers.$child = function (namespace) { return dispatchers[namespace]; };
    var dispatch = function (action) {
        return dependencies.$store.dispatch(action);
    };
    for (var _i = 0, _a = Object.keys(model.effects); _i < _a.length; _i++) {
        var key = _a[_i];
        dispatchers[key] = createActionDispatcher(namespaces.concat([key]).join("/"), dispatch);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        dispatchers[key] = createModelActionDispatchers(model.models[key], dependencies, namespaces.concat([key]), dispatchers);
    }
    return dispatchers;
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
    var dispatchers = helper.dispatch;
    var _loop_1 = function (key) {
        var effect = model.effects[key];
        var action$ = rootAction$.ofType(namespaces.concat([key]).join("/"));
        var output$ = action$.pipe(mergeMap(function (action) {
            var payload = action.payload;
            var asyncEffect = effect({
                action$: action$,
                rootAction$: rootAction$,
                state$: state$,
                rootState$: rootState$,
                helper: helper,
                actions: actions,
                getters: getters,
                dispatch: dispatchers,
                dependencies: dependencies
            }, payload);
            if (action.__dispatch_id != null) {
                var _asyncEffect_1 = asyncEffect;
                var dispatchId = action.__dispatch_id;
                var dispatcher = dispatchers[key];
                var _a = dispatcher._callbackById[dispatchId], resolve_1 = _a.resolve, reject_1 = _a.reject;
                asyncEffect = function (dispatch) {
                    var promise = _asyncEffect_1(dispatch);
                    promise.then(resolve_1, reject_1);
                    return promise;
                };
            }
            return toActionObservable(asyncEffect);
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
            dispatch: dispatchers,
            dependencies: dependencies
        });
        outputs.push(output$);
    }
    return outputs;
}
