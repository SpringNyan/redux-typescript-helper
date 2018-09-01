(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("immer"), require("redux-observable"), require("reselect"), require("rxjs"), require("rxjs/operators"));
	else if(typeof define === 'function' && define.amd)
		define(["immer", "redux-observable", "reselect", "rxjs", "rxjs/operators"], factory);
	else if(typeof exports === 'object')
		exports["redux-typescript-helper"] = factory(require("immer"), require("redux-observable"), require("reselect"), require("rxjs"), require("rxjs/operators"));
	else
		root["redux-typescript-helper"] = factory(root["immer"], root["redux-observable"], root["reselect"], root["rxjs"], root["rxjs/operators"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_immer__, __WEBPACK_EXTERNAL_MODULE_redux_observable__, __WEBPACK_EXTERNAL_MODULE_reselect__, __WEBPACK_EXTERNAL_MODULE_rxjs__, __WEBPACK_EXTERNAL_MODULE_rxjs_operators__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/action.js":
/*!***********************!*\
  !*** ./lib/action.js ***!
  \***********************/
/*! exports provided: actionTypes, createActionHelper */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "actionTypes", function() { return actionTypes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createActionHelper", function() { return createActionHelper; });
var actionTypes = {
    register: "@@REGISTER",
    epicEnd: "@@EPIC_END",
    unregister: "@@UNREGISTER"
};
function isAction(action) {
    return action != null && action.type === this.type;
}
function createActionHelper(type) {
    var actionHelper = (function (payload) { return ({
        type: type,
        payload: payload
    }); });
    actionHelper.type = type;
    actionHelper.is = isAction;
    return actionHelper;
}


/***/ }),

/***/ "./lib/epic.js":
/*!*********************!*\
  !*** ./lib/epic.js ***!
  \*********************/
/*! exports provided: asyncEffect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asyncEffect", function() { return asyncEffect; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "rxjs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_0__);

function asyncEffect(asyncFn) {
    return new rxjs__WEBPACK_IMPORTED_MODULE_0__["Observable"](function (subscribe) {
        var dispatch = function (action) {
            subscribe.next(action);
            return action;
        };
        asyncFn(dispatch).then(function () { return subscribe.complete(); }, function (reason) { return subscribe.error(reason); });
    });
}


/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/*! exports provided: actionTypes, createActionHelper, asyncEffect, ModelBuilder, createModelBuilderCreator, StoreHelperFactory, createStoreHelperFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _action__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./action */ "./lib/action.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "actionTypes", function() { return _action__WEBPACK_IMPORTED_MODULE_0__["actionTypes"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createActionHelper", function() { return _action__WEBPACK_IMPORTED_MODULE_0__["createActionHelper"]; });

/* harmony import */ var _epic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./epic */ "./lib/epic.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "asyncEffect", function() { return _epic__WEBPACK_IMPORTED_MODULE_1__["asyncEffect"]; });

/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./model */ "./lib/model.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ModelBuilder", function() { return _model__WEBPACK_IMPORTED_MODULE_2__["ModelBuilder"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createModelBuilderCreator", function() { return _model__WEBPACK_IMPORTED_MODULE_2__["createModelBuilderCreator"]; });

/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./store */ "./lib/store.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StoreHelperFactory", function() { return _store__WEBPACK_IMPORTED_MODULE_3__["StoreHelperFactory"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createStoreHelperFactory", function() { return _store__WEBPACK_IMPORTED_MODULE_3__["createStoreHelperFactory"]; });







/***/ }),

/***/ "./lib/model.js":
/*!**********************!*\
  !*** ./lib/model.js ***!
  \**********************/
/*! exports provided: ModelBuilder, createModelBuilderCreator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ModelBuilder", function() { return ModelBuilder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createModelBuilderCreator", function() { return createModelBuilderCreator; });
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! reselect */ "reselect");
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(reselect__WEBPACK_IMPORTED_MODULE_0__);
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
    function ModelBuilder(state) {
        this._selectors = {};
        this._reducers = {};
        this._effects = {};
        this._epics = [];
        this._models = {};
        this._state = state;
    }
    ModelBuilder.prototype.selectors = function (selectors) {
        if (typeof selectors === "function") {
            selectors = selectors(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"]);
        }
        this._selectors = __assign({}, this._selectors, selectors);
        return this;
    };
    ModelBuilder.prototype.reducers = function (reducers) {
        this._reducers = __assign({}, this._reducers, reducers);
        return this;
    };
    ModelBuilder.prototype.effects = function (effects) {
        this._effects = __assign({}, this._effects, effects);
        return this;
    };
    ModelBuilder.prototype.epics = function (epics) {
        this._epics = this._epics.concat(epics);
        return this;
    };
    ModelBuilder.prototype.models = function (models) {
        this._models = __assign({}, this._models, models);
        return this;
    };
    ModelBuilder.prototype.dynamicModels = function () {
        return this;
    };
    ModelBuilder.prototype.build = function () {
        return {
            state: this._state,
            selectors: __assign({}, this._selectors),
            reducers: __assign({}, this._reducers),
            effects: __assign({}, this._effects),
            epics: this._epics.slice(),
            models: __assign({}, this._models)
        };
    };
    return ModelBuilder;
}());

function createModelBuilder(state) {
    return new ModelBuilder(state);
}
function createModelBuilderCreator() {
    return createModelBuilder;
}


/***/ }),

/***/ "./lib/store.js":
/*!**********************!*\
  !*** ./lib/store.js ***!
  \**********************/
/*! exports provided: StoreHelperFactory, createStoreHelperFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StoreHelperFactory", function() { return StoreHelperFactory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createStoreHelperFactory", function() { return createStoreHelperFactory; });
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immer */ "immer");
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immer__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "rxjs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var redux_observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! redux-observable */ "redux-observable");
/* harmony import */ var redux_observable__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(redux_observable__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _action__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./action */ "./lib/action.js");
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
        this._reducer = createModelReducer(model, dependencies);
        this._actions = createModelActionHelpers(model, [], null);
        this._getters = createModelGetters(model, function () { return _this._store.getState(); }, this._dependencies, [], null);
        var initialEpic = createModelRootEpic(model, [], this._actions, this._getters, this._dependencies, { errorHandler: this._options.epicErrorHandler });
        this._addEpic$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](initialEpic);
        this._epic = function (action$, state$, epicDependencies) {
            return _this._addEpic$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["mergeMap"])(function (epic) { return epic(action$, state$, epicDependencies); }));
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

function createStoreHelperFactory(model, dependencies, options) {
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
        this._actions[namespace] = createModelActionHelpers(model, namespaces, this
            ._actions);
        this._getters[namespace] = createModelGetters(model, function () { return _this._store.getState(); }, this._dependencies, namespaces, this._getters);
        this._addEpic$.next(createModelRootEpic(model, namespaces, this._actions.$root, this._getters.$root, this._dependencies, { errorHandler: this._options.epicErrorHandler }));
        this._store.dispatch({
            type: namespaces.join("/") + "/" + _action__WEBPACK_IMPORTED_MODULE_4__["actionTypes"].register
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
            type: namespaces.join("/") + "/" + _action__WEBPACK_IMPORTED_MODULE_4__["actionTypes"].epicEnd
        });
        this._store.dispatch({
            type: namespaces.join("/") + "/" + _action__WEBPACK_IMPORTED_MODULE_4__["actionTypes"].unregister
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
function createModelActionHelpers(model, namespaces, parent) {
    var actions = {
        $namespace: namespaces.join("/"),
        $epicEnd: Object(_action__WEBPACK_IMPORTED_MODULE_4__["createActionHelper"])(namespaces.concat([_action__WEBPACK_IMPORTED_MODULE_4__["actionTypes"].epicEnd]).join("/")),
        $parent: parent
    };
    actions.$root = parent != null ? parent.$root : actions;
    for (var _i = 0, _a = Object.keys(model.reducers).concat(Object.keys(model.effects)); _i < _a.length; _i++) {
        var key = _a[_i];
        actions[key] = Object(_action__WEBPACK_IMPORTED_MODULE_4__["createActionHelper"])(namespaces.concat([key]).join("/"));
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
    var state$ = new redux_observable__WEBPACK_IMPORTED_MODULE_3__["StateObservable"](rootState$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])(function (state) { return getSubProperty(state, namespaces); }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["distinctUntilChanged"])()), getSubProperty(rootState$.value, namespaces));
    var actions = getSubProperty(rootActions, namespaces);
    var getters = getSubProperty(rootGetters, namespaces);
    var _loop_2 = function (key) {
        var effect;
        var operator = rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["mergeMap"];
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
        var action$ = new redux_observable__WEBPACK_IMPORTED_MODULE_3__["ActionsObservable"](rootAction$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["filter"])(function (action) {
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
        var unregisterType = namespaces.join("/") + "/" + _action__WEBPACK_IMPORTED_MODULE_4__["actionTypes"].unregister;
        var takeUntil$ = rootAction$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["filter"])(function (action) { return action.type === unregisterType; }));
        return rxjs__WEBPACK_IMPORTED_MODULE_1__["merge"].apply(void 0, registerModelEpics(model, namespaces, rootActions, rootGetters, rootAction$, rootState$, dependencies).map(function (epic) {
            return options.errorHandler != null
                ? epic.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])(function (err, caught) { return options.errorHandler(err, caught); }))
                : epic;
        })).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["takeUntil"])(takeUntil$));
    };
}
function createModelReducer(model, dependencies) {
    return (function (state, action) {
        state = initializeModelState(state, model, dependencies);
        return immer__WEBPACK_IMPORTED_MODULE_0___default()(state, function (draft) {
            var namespaces = action.type.split("/");
            var stateName = namespaces[namespaces.length - 2];
            var actionType = namespaces[namespaces.length - 1];
            var parentState = getSubProperty(draft, namespaces.slice(0, namespaces.length - 2));
            var subModel = getSubProperty(model, namespaces.slice(0, namespaces.length - 1), function (o, p) { return o.models[p]; });
            if (actionType === _action__WEBPACK_IMPORTED_MODULE_4__["actionTypes"].unregister) {
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
    var _loop_3 = function (key) {
        Object.defineProperty(getters, key, {
            get: function () {
                var rootState = getState();
                var state = getSubProperty(rootState, namespaces);
                return model.selectors[key]({
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
    for (var _i = 0, _a = Object.keys(model.selectors); _i < _a.length; _i++) {
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


/***/ }),

/***/ "immer":
/*!************************!*\
  !*** external "immer" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_immer__;

/***/ }),

/***/ "redux-observable":
/*!***********************************!*\
  !*** external "redux-observable" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_redux_observable__;

/***/ }),

/***/ "reselect":
/*!***************************!*\
  !*** external "reselect" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_reselect__;

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_operators__;

/***/ })

/******/ });
});
//# sourceMappingURL=redux-typescript-helper.js.map