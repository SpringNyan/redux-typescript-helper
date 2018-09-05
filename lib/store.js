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
import { map, mergeMap, filter, distinctUntilChanged, takeUntil, catchError } from "rxjs/operators";
import { ActionsObservable, StateObservable } from "redux-observable";
import { createSelector } from "reselect";
import { actionTypes, createActionHelper } from "./action";
import { cloneModel } from "./model";
var StoreHelperFactory = /** @class */ (function () {
    function StoreHelperFactory(model, dependencies, options) {
        var _this = this;
        this._model = model;
        this._options = options;
        this._dependencies = {};
        var _loop_1 = function (key) {
            Object.defineProperty(this_1._dependencies, key, {
                get: function () {
                    return dependencies[key];
                },
                enumerable: true,
                configurable: true
            });
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.keys(dependencies); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_1(key);
        }
        this._reducer = createModelReducer(model, this._dependencies);
        this._actions = createModelActionHelpers(model, [], null);
        this._getters = createModelGetters(model, function () { return _this._store.getState(); }, this._dependencies, [], null);
        var initialEpic = createModelRootEpic(model, [], this._actions, this._getters, this._dependencies, { errorHandler: this._options.epicErrorHandler });
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
        var storeHelper = new _StoreHelper(store, this._model, [], this._actions, this._getters, this._addEpic$, this._dependencies, this._options);
        this._dependencies.$storeHelper = storeHelper;
        return storeHelper;
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
    function _StoreHelper(store, model, namespaces, actions, getters, addEpic$, dependencies, options) {
        this._subStoreHelpers = {};
        this._store = store;
        this._model = model;
        this._namespaces = namespaces;
        this._actions = actions;
        this._getters = getters;
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
    _StoreHelper.prototype.child = function (namespace) {
        var helper = this._subStoreHelpers[namespace];
        return helper != null ? helper : null;
    };
    _StoreHelper.prototype.registerModel = function (namespace, model) {
        var _this = this;
        if (this._model.models[namespace] != null) {
            throw new Error("Failed to register model: model is already registered");
        }
        var namespaces = this._namespaces.concat([namespace]);
        this._model.models[namespace] = cloneModel(model);
        this._actions[namespace] = createModelActionHelpers(model, namespaces, this
            ._actions);
        this._getters[namespace] = createModelGetters(model, function () { return _this._store.getState(); }, this._dependencies, namespaces, this._getters);
        this._addEpic$.next(createModelRootEpic(model, namespaces, this._actions.$root, this._getters.$root, this._dependencies, { errorHandler: this._options.epicErrorHandler }));
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.register
        });
        this._registerSubStoreHelper(namespace);
    };
    _StoreHelper.prototype.unregisterModel = function (namespace) {
        if (this._model.models[namespace] == null) {
            throw new Error("Failed to unregister model: model is not existing");
        }
        var namespaces = this._namespaces.concat([namespace]);
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.epicEnd
        });
        this._unregisterSubStoreHelper(namespace);
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.unregister
        });
        delete this._model.models[namespace];
        delete this._actions[namespace];
        delete this._getters[namespace];
    };
    _StoreHelper.prototype._registerSubStoreHelper = function (namespace) {
        var _this = this;
        this._subStoreHelpers[namespace] = new _StoreHelper(this._store, this._model.models[namespace], this._namespaces.concat([namespace]), this._actions[namespace], this._getters[namespace], this._addEpic$, this._dependencies, this._options);
        Object.defineProperty(this, namespace, {
            get: function () {
                return _this.child(namespace);
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
function createModelActionHelpers(model, namespaces, parent) {
    var actions = {
        $namespace: namespaces.join("/"),
        $parent: parent
    };
    actions.$root = parent != null ? parent.$root : actions;
    for (var _i = 0, _a = Object.keys(model.reducers).concat(Object.keys(model.effects)); _i < _a.length; _i++) {
        var key = _a[_i];
        actions[key] = createActionHelper(namespaces.concat([key]).join("/"));
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        actions[key] = createModelActionHelpers(model.models[key], namespaces.concat([key]), actions);
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
    var state$ = new StateObservable(rootState$.pipe(map(function (state) { return getSubProperty(state, namespaces); }), distinctUntilChanged()), getSubProperty(rootState$.value, namespaces));
    var actions = getSubProperty(rootActions, namespaces);
    var getters = getSubProperty(rootGetters, namespaces);
    var _loop_2 = function (key) {
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
        _loop_2(key);
    }
    var namespacePrefix = namespaces.join("/");
    for (var _d = 0, _e = model.epics; _d < _e.length; _d++) {
        var epic = _e[_d];
        var action$ = new ActionsObservable(rootAction$.pipe(filter(function (action) {
            return typeof action.type === "string" &&
                action.type.lastIndexOf(namespacePrefix, 0) === 0;
        })));
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
function createModelRootEpic(model, namespaces, rootActions, rootGetters, dependencies, options) {
    return function (rootAction$, rootState$) {
        var unregisterType = namespaces.join("/") + "/" + actionTypes.unregister;
        var takeUntil$ = rootAction$.pipe(filter(function (action) { return action.type === unregisterType; }));
        return merge.apply(void 0, registerModelEpics(model, namespaces, rootActions, rootGetters, rootAction$, rootState$, dependencies).map(function (epic) {
            return options.errorHandler != null
                ? epic.pipe(catchError(function (err, caught) { return options.errorHandler(err, caught); }))
                : epic;
        })).pipe(takeUntil(takeUntil$));
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
function createModelGetters(model, getState, dependencies, namespaces, parent) {
    var getters = {
        $namespace: namespaces.join("/"),
        get $state() {
            return getSubProperty(getState(), namespaces);
        },
        get $rootState() {
            return getState();
        },
        $parent: parent
    };
    getters.$root = parent != null ? parent.$root : getters;
    var selectors = model.selectors(createSelector);
    var _loop_3 = function (key) {
        Object.defineProperty(getters, key, {
            get: function () {
                var rootState = getState();
                var state = getSubProperty(rootState, namespaces);
                return selectors[key]({
                    state: state,
                    rootState: rootState,
                    getters: getters,
                    rootGetters: getters.$root,
                    dependencies: dependencies
                });
            },
            enumerable: true,
            configurable: true
        });
    };
    for (var _i = 0, _a = Object.keys(selectors); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_3(key);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        getters[key] = createModelGetters(model.models[key], getState, dependencies, namespaces.concat([key]), getters);
    }
    return getters;
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
function getSubProperty(obj, paths, map) {
    return paths.reduce(function (o, path) {
        return o != null ? (map ? map(o, path) : o[path]) : undefined;
    }, obj);
}
