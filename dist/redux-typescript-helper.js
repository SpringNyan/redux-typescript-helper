import { ActionsObservable, StateObservable } from 'redux-observable';
import produce from 'immer';
import { Observable, merge, BehaviorSubject } from 'rxjs';
import { map, filter, mergeMap, catchError, takeUntil, distinctUntilChanged } from 'rxjs/operators';

var ActionDispatchCallback = /** @class */ (function () {
    function ActionDispatchCallback() {
        // TODO: es5 fallback
        this._itemMap = new Map();
    }
    ActionDispatchCallback.prototype.setDispatched = function (action) {
        var item = this._itemMap.get(action);
        if (item != null) {
            item.hasDispatched = true;
        }
    };
    ActionDispatchCallback.prototype.hasDispatched = function (action) {
        var item = this._itemMap.get(action);
        if (item != null) {
            return item.hasDispatched;
        }
        return false;
    };
    ActionDispatchCallback.prototype.resolve = function (action) {
        var item = this._itemMap.get(action);
        if (item != null) {
            item.resolve();
            this._itemMap.delete(action);
        }
    };
    ActionDispatchCallback.prototype.reject = function (action, err) {
        var item = this._itemMap.get(action);
        if (item != null) {
            item.reject(err);
            this._itemMap.delete(action);
        }
    };
    ActionDispatchCallback.prototype.register = function (action) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._itemMap.set(action, {
                hasDispatched: false,
                resolve: resolve,
                reject: reject
            });
        });
    };
    return ActionDispatchCallback;
}());
var actionDispatchCallback = new ActionDispatchCallback();
var actionTypes = {
    register: "@@REGISTER",
    epicEnd: "@@EPIC_END",
    unregister: "@@UNREGISTER"
};
function isAction(action) {
    return action != null && action.type === this.type;
}
function createActionHelper(type, defaultDispatch) {
    var actionHelper = (function (payload) { return ({
        type: type,
        payload: payload
    }); });
    actionHelper.type = type;
    actionHelper.is = isAction;
    actionHelper.dispatch = function (payload, dispatch) {
        var action = actionHelper(payload);
        var promise = actionDispatchCallback.register(action);
        (dispatch || defaultDispatch)(action);
        Promise.resolve().then(function () {
            if (!actionDispatchCallback.hasDispatched(action)) {
                actionDispatchCallback.resolve(action);
            }
        });
        return promise;
    };
    return actionHelper;
}
function createModelActionHelpers(model, dependencies, namespaces, parent) {
    var actions = {
        $namespace: namespaces.join("/"),
        $parent: parent
    };
    actions.$root = parent != null ? parent.$root : actions;
    actions.$child = function (namespace) { return actions[namespace]; };
    var dispatch = function (action) {
        return dependencies.$store.dispatch(action);
    };
    for (var _i = 0, _a = Object.keys(model.reducers).concat(Object.keys(model.effects)); _i < _a.length; _i++) {
        var key = _a[_i];
        actions[key] = createActionHelper(namespaces.concat([key]).join("/"), dispatch);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        actions[key] = createModelActionHelpers(model.models[key], dependencies, namespaces.concat([key]), actions);
    }
    return actions;
}

function getIn(obj, paths, map$$1) {
    return paths.reduce(function (o, path) {
        return o != null ? (map$$1 ? map$$1(o, path) : o[path]) : undefined;
    }, obj);
}
function startsWith(str, test) {
    if (str.startsWith) {
        return str.startsWith(test);
    }
    else {
        return str.lastIndexOf(test, 0) === 0;
    }
}
function endsWith(str, test) {
    if (str.endsWith) {
        return str.endsWith(test);
    }
    else {
        var offset = str.length - test.length;
        return offset >= 0 && str.lastIndexOf(test, offset) === offset;
    }
}

function toActionObservable(asyncEffect) {
    return new Observable(function (subscribe) {
        var dispatch = function (action) {
            subscribe.next(action);
            return action;
        };
        asyncEffect(dispatch).then(function () { return subscribe.complete(); }, function (reason) { return subscribe.error(reason); });
    });
}
function createModelEpic(model, dependencies, errorHandler, namespaces) {
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

var __assign = (undefined && undefined.__assign) || function () {
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
var ModelBuilder = /** @class */ (function () {
    function ModelBuilder(model) {
        this._isFrozen = false;
        this._model = cloneModel(model);
    }
    ModelBuilder.prototype.dependencies = function () {
        if (this._isFrozen) {
            return this.clone().dependencies();
        }
        return this;
    };
    ModelBuilder.prototype.state = function (state) {
        if (this._isFrozen) {
            return this.clone().state(state);
        }
        var oldState = this._model.state;
        var newState = toFactoryIfNeeded(state);
        this._model.state =
            oldState == null
                ? newState
                : function (dependencies) { return (__assign({}, oldState(dependencies), newState(dependencies))); };
        return this;
    };
    ModelBuilder.prototype.selectors = function (selectors) {
        if (this._isFrozen) {
            return this.clone().selectors(selectors);
        }
        var oldSelectors = this._model.selectors;
        var newSelectors = toFactoryIfNeeded(selectors);
        this._model.selectors = function (selectorCreator) { return (__assign({}, oldSelectors(selectorCreator), newSelectors(selectorCreator))); };
        return this;
    };
    ModelBuilder.prototype.reducers = function (reducers) {
        if (this._isFrozen) {
            return this.clone().reducers(reducers);
        }
        this._model.reducers = __assign({}, this._model.reducers, reducers);
        return this;
    };
    ModelBuilder.prototype.effects = function (effects) {
        if (this._isFrozen) {
            return this.clone().effects(effects);
        }
        this._model.effects = __assign({}, this._model.effects, effects);
        return this;
    };
    ModelBuilder.prototype.epics = function (epics) {
        if (this._isFrozen) {
            return this.clone().epics(epics);
        }
        this._model.epics = this._model.epics.concat(epics);
        return this;
    };
    ModelBuilder.prototype.models = function (models) {
        if (this._isFrozen) {
            return this.clone().models(models);
        }
        this._model.models = __assign({}, this._model.models, models);
        return this;
    };
    ModelBuilder.prototype.dynamicModels = function () {
        if (this._isFrozen) {
            return this.clone().dynamicModels();
        }
        return this;
    };
    ModelBuilder.prototype.build = function () {
        if (this._model.state == null) {
            throw new Error("state is not defined");
        }
        return cloneModel(this._model);
    };
    ModelBuilder.prototype.clone = function () {
        return new ModelBuilder(this._model);
    };
    ModelBuilder.prototype.freeze = function () {
        this._isFrozen = true;
        return this;
    };
    return ModelBuilder;
}());
function toFactoryIfNeeded(obj) {
    return typeof obj === "function" ? obj : function () { return obj; };
}
function createModelBuilder() {
    return new ModelBuilder({
        state: undefined,
        selectors: function () { return ({}); },
        reducers: {},
        effects: {},
        epics: [],
        models: {}
    });
}
function cloneModel(model) {
    return {
        state: model.state,
        selectors: model.selectors,
        reducers: __assign({}, model.reducers),
        effects: __assign({}, model.effects),
        epics: model.epics.slice(),
        models: __assign({}, model.models)
    };
}

var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
function createModelReducer(model, dependencies) {
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
                var originalTargetState = getIn(rootState, namespaces.slice(0, namespaces.length - 1));
                var nextTargetState = targetReducer(targetState, action.payload, originalTargetState);
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
        return __assign$1({}, state, subStates);
    }
    else {
        return state;
    }
}

var createSelector = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var selectors = args.slice(0, args.length - 1);
    var combiner = args[args.length - 1];
    var lastDependencies;
    var lastValue;
    return function (context) {
        var needEvaluate = false;
        var dependencies = selectors.map(function (selector) { return selector(context); });
        if (lastDependencies == null ||
            dependencies.some(function (dep, index) { return dep !== lastDependencies[index]; })) {
            needEvaluate = true;
        }
        lastDependencies = dependencies;
        if (needEvaluate) {
            lastValue = combiner.apply(void 0, dependencies.concat([context]));
        }
        return lastValue;
    };
};
function createModelGetters(model, dependencies, namespaces, parent) {
    var getters = {
        get state() {
            return getIn(dependencies.$store.getState(), namespaces);
        },
        $namespace: namespaces.join("/"),
        $parent: parent
    };
    getters.$root = parent != null ? parent.$root : getters;
    getters.$child = function (namespace) { return getters[namespace]; };
    var selectors = model.selectors(createSelector);
    var _loop_1 = function (key) {
        Object.defineProperty(getters, key, {
            get: function () {
                var helper = getIn(dependencies.$storeHelper, namespaces, function (obj, key) { return obj.$child(key); });
                return selectors[key]({
                    state: helper.state,
                    rootState: helper.$root.state,
                    helper: helper,
                    actions: helper.actions,
                    getters: helper.getters,
                    dependencies: dependencies
                });
            },
            enumerable: true,
            configurable: true
        });
    };
    for (var _i = 0, _a = Object.keys(selectors); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_1(key);
    }
    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {
        var key = _c[_b];
        getters[key] = createModelGetters(model.models[key], dependencies, namespaces.concat([key]), getters);
    }
    return getters;
}

var StoreHelperFactory = /** @class */ (function () {
    function StoreHelperFactory(dependencies, model, options) {
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
        this._actions = createModelActionHelpers(this._model, this._dependencies, [], null);
        this._getters = createModelGetters(this._model, this._dependencies, [], null);
        this._storeHelper = new _StoreHelper(this._model, this._dependencies, this._options, this._actions, this._getters, function (epic) { return _this._addEpic$.next(epic); }, [], null);
        this._dependencies.$storeHelper = this._storeHelper;
        this._reducer = createModelReducer(this._model, this._dependencies);
        var initialEpic = createModelEpic(model, this._dependencies, this._options.epicErrorHandler || null, []);
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
            throw new Error("store helper is already created");
        }
        this._store = store;
        this._dependencies.$store = this._store;
        return this._storeHelper;
    };
    return StoreHelperFactory;
}());
function createStoreHelperFactory(dependencies, model, options) {
    if (options == null) {
        options = {};
    }
    return new StoreHelperFactory(dependencies, model, options);
}
var _StoreHelper = /** @class */ (function () {
    function _StoreHelper(model, dependencies, options, actions, getters, addEpic, namespaces, parent) {
        this._subStoreHelpers = {};
        this._model = model;
        this._dependencies = dependencies;
        this._options = options;
        this._actions = actions;
        this._getters = getters;
        this._addEpic = addEpic;
        this._namespaces = namespaces;
        this.$namespace = namespaces.join("/");
        this.$parent = parent;
        this.$root = parent != null ? parent.$root : this;
        for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
            var namespace = _a[_i];
            this._registerSubStoreHelper(namespace);
        }
    }
    Object.defineProperty(_StoreHelper.prototype, "state", {
        get: function () {
            return getIn(this._store.getState(), this._namespaces);
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
    _StoreHelper.prototype.$child = function (namespace) {
        var helper = this._subStoreHelpers[namespace];
        return helper != null ? helper : null;
    };
    _StoreHelper.prototype.$registerModel = function (namespace, model) {
        if (this._model.models[namespace] != null) {
            throw new Error("model is already registered");
        }
        this._model.models[namespace] = model;
        var namespaces = this._namespaces.concat([namespace]);
        this._actions[namespace] = createModelActionHelpers(model, this._dependencies, namespaces, this._actions);
        this._getters[namespace] = createModelGetters(model, this._dependencies, namespaces, this._getters);
        this._registerSubStoreHelper(namespace);
        this._addEpic(createModelEpic(model, this._dependencies, this._options.epicErrorHandler || null, namespaces));
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.register
        });
    };
    _StoreHelper.prototype.$unregisterModel = function (namespace) {
        if (this._model.models[namespace] == null) {
            throw new Error("model is already unregistered");
        }
        var namespaces = this._namespaces.concat([namespace]);
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.epicEnd
        });
        this._unregisterSubStoreHelper(namespace);
        delete this._actions[namespace];
        delete this._getters[namespace];
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.unregister
        });
        delete this._model.models[namespace];
    };
    Object.defineProperty(_StoreHelper.prototype, "_store", {
        get: function () {
            return this._dependencies.$store;
        },
        enumerable: true,
        configurable: true
    });
    _StoreHelper.prototype._registerSubStoreHelper = function (namespace) {
        var _this = this;
        this._subStoreHelpers[namespace] = new _StoreHelper(this._model.models[namespace], this._dependencies, this._options, this._actions[namespace], this._getters[namespace], this._addEpic, this._namespaces.concat([namespace]), this);
        Object.defineProperty(this, namespace, {
            get: function () {
                return _this.$child(namespace);
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

export { actionDispatchCallback, actionTypes, createActionHelper, createModelActionHelpers, toActionObservable, createModelEpic, ModelBuilder, createModelBuilder, cloneModel, createModelReducer, createModelGetters, StoreHelperFactory, createStoreHelperFactory };
