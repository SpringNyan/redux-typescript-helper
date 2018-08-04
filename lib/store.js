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
import { BehaviorSubject, merge } from "rxjs";
import { map, mergeMap, filter, takeUntil, catchError } from "rxjs/operators";
import { ActionsObservable, StateObservable } from "redux-observable";
import { actionTypes, createActionHelper } from "./action";
var StoreHelperFactory = /** @class */ (function () {
    function StoreHelperFactory(model, dependencies, options) {
        var _this = this;
        this._model = model;
        this._dependencies = dependencies;
        this._options = options;
        this._reducer = createModelReducer(model, dependencies);
        this._actions = createModelActionHelpers(model, []);
        this._getters = createModelGetters(model, function () { return _this._store.getState(); }, this._dependencies, [], null);
        var initialEpic = createModelRootEpic(model, [], this._actions, this._getters, dependencies, { errorHandler: this._options.epicErrorHandler });
        this._addEpic$ = new BehaviorSubject(initialEpic);
        this._epic = function (action$, state$, epicDependencies) {
            return _this._addEpic$.pipe(mergeMap(function (epic) { return epic(action$, state$, epicDependencies); }));
        };
    }
    Object.defineProperty(StoreHelperFactory.prototype, "reducer", {
        get: function () {
            return this._reducer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoreHelperFactory.prototype, "epic", {
        get: function () {
            return this._epic;
        },
        enumerable: true,
        configurable: true
    });
    StoreHelperFactory.prototype.create = function (store) {
        if (this._store != null) {
            throw new Error("Store helper is already created");
        }
        this._store = store;
        return new _StoreHelper(store, this._model, [], this._actions, this._getters, this._getters, this._addEpic$, this._dependencies, this._options);
    };
    return StoreHelperFactory;
}());
export { StoreHelperFactory };
export function createStoreHelperFactory(model, dependencies, options) {
    if (options == null) {
        options = {};
    }
    return new StoreHelperFactory(model, dependencies, options);
}
var _StoreHelper = /** @class */ (function () {
    function _StoreHelper(store, model, namespaces, actions, getters, rootGetters, addEpic$, dependencies, options) {
        this._subStoreHelpers = {};
        this._store = store;
        this._model = model;
        this._namespaces = namespaces;
        this._actions = actions;
        this._getters = getters;
        this._rootGetters = rootGetters;
        this._addEpic$ = addEpic$;
        this._dependencies = dependencies;
        this._options = options;
        for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
            var namespace = _a[_i];
            this._registerSubStoreHelper(namespace);
        }
    }
    Object.defineProperty(_StoreHelper.prototype, "store", {
        get: function () {
            return this._store;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(_StoreHelper.prototype, "state", {
        get: function () {
            return getSubProperty(this._store.getState(), this._namespaces);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(_StoreHelper.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(_StoreHelper.prototype, "getters", {
        get: function () {
            return this._getters;
        },
        enumerable: true,
        configurable: true
    });
    _StoreHelper.prototype.namespace = function (namespace) {
        return this._subStoreHelpers[namespace];
    };
    _StoreHelper.prototype.registerModel = function (namespace, model) {
        var _this = this;
        if (this._model.models[namespace] != null) {
            throw new Error("Failed to register model: model is already registered");
        }
        var namespaces = this._namespaces.concat([namespace]);
        this._model.models[namespace] = cloneModel(model);
        this._actions[namespace] = createModelActionHelpers(model, namespaces);
        this._getters[namespace] = createModelGetters(model, function () { return _this._store.getState(); }, this._dependencies, namespaces, this._rootGetters);
        this._addEpic$.next(createModelRootEpic(model, namespaces, this.actions[namespace], this.getters[namespace], this._dependencies, { errorHandler: this._options.epicErrorHandler }));
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.register
        });
        this._registerSubStoreHelper(namespace);
    };
    _StoreHelper.prototype.unregisterModel = function (namespace) {
        if (this._model.models[namespace] == null) {
            throw new Error("Failed to unregister model: model is not existing");
        }
        this._unregisterSubStoreHelper(namespace);
        var namespaces = this._namespaces.concat([namespace]);
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.epicEnd
        });
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.unregister
        });
        delete this._model.models[namespace];
        delete this._actions[namespace];
        delete this._getters[namespace];
    };
    _StoreHelper.prototype._registerSubStoreHelper = function (namespace) {
        var _this = this;
        this._subStoreHelpers[namespace] = new _StoreHelper(this._store, this._model.models[namespace], this._namespaces.concat([namespace]), this._actions[namespace], this._getters[namespace], this._rootGetters, this._addEpic$, this._dependencies, this._options);
        Object.defineProperty(this, namespace, {
            get: function () {
                return _this.namespace(namespace);
            },
            enumerable: true,
            configurable: true
        });
    };
    _StoreHelper.prototype._unregisterSubStoreHelper = function (namespace) {
        delete this[namespace];
        delete this._subStoreHelpers[namespace];
    };
    return _StoreHelper;
}());
function createModelActionHelpers(model, namespaces) {
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
function registerModelEpics(model, namespaces, rootActions, rootGetters, rootAction$, rootState$, dependencies) {
    var outputs = [];
    for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
        var key = _a[_i];
        var subModel = model.models[key];
        var subOutputs = registerModelEpics(subModel, namespaces.concat([key]), rootActions, rootGetters, rootAction$, rootState$, dependencies);
        outputs.push.apply(outputs, subOutputs);
    }
    var unregisterType = namespaces.join("/") + "/" + actionTypes.unregister;
    var takeUntil$ = rootAction$.pipe(filter(function (action) { return action.type === unregisterType; }));
    rootAction$ = new ActionsObservable(rootAction$.pipe(takeUntil(takeUntil$)));
    rootState$ = new StateObservable(rootState$.pipe(takeUntil(takeUntil$)), rootState$.value);
    var state$ = new StateObservable(rootState$.pipe(map(function (state) { return getSubProperty(state, namespaces); })), getSubProperty(rootState$.value, namespaces));
    var actions = getSubProperty(rootActions, namespaces);
    var getters = getSubProperty(rootGetters, namespaces);
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
                getters: getters,
                rootGetters: rootGetters,
                dependencies: dependencies
            }, payload);
        }));
        outputs.push(output$);
    };
    for (var _b = 0, _c = Object.keys(model.effects); _b < _c.length; _b++) {
        var key = _c[_b];
        _loop_1(key);
    }
    var namespacePrefix = namespaces.join("/");
    for (var _d = 0, _e = model.epics; _d < _e.length; _d++) {
        var epic = _e[_d];
        var action$ = new ActionsObservable(rootAction$.pipe(filter(function (action) { return action.type.lastIndexOf(namespacePrefix, 0) === 0; })));
        var output$ = epic({
            action$: action$,
            rootAction$: rootAction$,
            state$: state$,
            rootState$: rootState$,
            actions: actions,
            rootActions: rootActions,
            getters: getters,
            rootGetters: rootGetters,
            dependencies: dependencies
        });
        outputs.push(output$);
    }
    return outputs;
}
function createModelRootEpic(model, namespaces, actions, getters, dependencies, options) {
    return function (action$, state$) {
        return merge.apply(void 0, registerModelEpics(model, namespaces, actions, getters, action$, state$, dependencies).map(function (epic) {
            return options.errorHandler != null
                ? epic.pipe(catchError(function (err, caught) { return options.errorHandler(err, caught); }))
                : epic;
        }));
    };
}
function createModelReducer(model, dependencies) {
    return (function (state, action) {
        state = initializeModelState(state, model, dependencies);
        return produce(state, function (draft) {
            var namespaces = action.type.split("/");
            var stateName = namespaces[namespaces.length - 2];
            var actionType = namespaces[namespaces.length - 1];
            var parentState = getSubProperty(draft, namespaces.slice(0, namespaces.length - 2));
            var subModel = getSubProperty(model, namespaces.slice(0, namespaces.length - 1), function (o, p) { return o.models[p]; });
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
function createModelGetters(model, getState, dependencies, namespaces, rootGetters) {
    if (rootGetters == null && namespaces.length > 0) {
        throw new Error("rootGetters is required for creating sub model getters");
    }
    var getters = {};
    if (rootGetters == null) {
        rootGetters = getters;
    }
    var _loop_2 = function (key) {
        Object.defineProperty(getters, key, {
            get: function () {
                var rootState = getState();
                var state = getSubProperty(rootState, namespaces);
                return model.selectors[key]({
                    state: state,
                    rootState: rootState,
                    getters: getters,
                    rootGetters: rootGetters,
                    dependencies: dependencies
                });
            },
            enumerable: true,
            configurable: true
        });
    };
    for (var _i = 0, _a = Object.keys(model.selectors); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_2(key);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        getters[key] = createModelGetters(model.models[key], getState, dependencies, namespaces.concat([key]), rootGetters);
    }
    return getters;
}
function initializeModelState(state, model, dependencies) {
    if (state === undefined) {
        if (typeof model.state === "function") {
            state = model.state(dependencies);
        }
        else {
            state = model.state;
        }
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
function cloneModel(model) {
    return {
        state: model.state,
        selectors: __assign({}, model.selectors),
        reducers: __assign({}, model.reducers),
        effects: __assign({}, model.effects),
        epics: model.epics.slice(),
        models: __assign({}, model.models)
    };
}
function getSubProperty(obj, paths, map) {
    return paths.reduce(function (o, path) {
        return o != null ? (map ? map(o, path) : o[path]) : undefined;
    }, obj);
}
