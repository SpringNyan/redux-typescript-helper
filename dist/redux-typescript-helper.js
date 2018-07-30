(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("immer"), require("redux-observable"), require("rxjs"), require("rxjs/operators"));
	else if(typeof define === 'function' && define.amd)
		define(["immer", "redux-observable", "rxjs", "rxjs/operators"], factory);
	else if(typeof exports === 'object')
		exports["redux-typescript-helper"] = factory(require("immer"), require("redux-observable"), require("rxjs"), require("rxjs/operators"));
	else
		root["redux-typescript-helper"] = factory(root["immer"], root["redux-observable"], root["rxjs"], root["rxjs/operators"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_immer__, __WEBPACK_EXTERNAL_MODULE_redux_observable__, __WEBPACK_EXTERNAL_MODULE_rxjs__, __WEBPACK_EXTERNAL_MODULE_rxjs_operators__) {
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
/*! exports provided: actionTypes, createActionHelper, createModelActionHelpers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"actionTypes\", function() { return actionTypes; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createActionHelper\", function() { return createActionHelper; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createModelActionHelpers\", function() { return createModelActionHelpers; });\nvar actionTypes = {\r\n    register: \"@@REGISTER\",\r\n    epicEnd: \"@@EPIC_END\",\r\n    unregister: \"@@UNREGISTER\"\r\n};\r\nfunction isAction(action) {\r\n    return action != null && action.type === this.type;\r\n}\r\nfunction createActionHelper(type) {\r\n    var actionHelper = (function (payload) { return ({\r\n        type: type,\r\n        payload: payload\r\n    }); });\r\n    actionHelper.type = type;\r\n    actionHelper.is = isAction;\r\n    return actionHelper;\r\n}\r\nfunction createModelActionHelpers(model, namespaces) {\r\n    var actions = {};\r\n    for (var _i = 0, _a = Object.keys(model.reducers).concat(Object.keys(model.effects)); _i < _a.length; _i++) {\r\n        var key = _a[_i];\r\n        actions[key] = createActionHelper(namespaces.concat([key]).join(\"/\"));\r\n    }\r\n    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {\r\n        var key = _c[_b];\r\n        actions[key] = createModelActionHelpers(model.models[key], namespaces.concat([\r\n            key\r\n        ]));\r\n    }\r\n    return actions;\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/action.js?");

/***/ }),

/***/ "./lib/epic.js":
/*!*********************!*\
  !*** ./lib/epic.js ***!
  \*********************/
/*! exports provided: registerModelEpics, createModelRootEpic, asyncEffect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"registerModelEpics\", function() { return registerModelEpics; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createModelRootEpic\", function() { return createModelRootEpic; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"asyncEffect\", function() { return asyncEffect; });\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ \"rxjs\");\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ \"rxjs/operators\");\n/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var redux_observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux-observable */ \"redux-observable\");\n/* harmony import */ var redux_observable__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(redux_observable__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _action__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./action */ \"./lib/action.js\");\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util */ \"./lib/util.js\");\n\r\n\r\n\r\n\r\n\r\nfunction registerModelEpics(model, namespaces, rootActions, rootGetters, rootAction$, rootState$, dependencies) {\r\n    var outputs = [];\r\n    for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {\r\n        var key = _a[_i];\r\n        var subModel = model.models[key];\r\n        var subOutputs = registerModelEpics(subModel, namespaces.concat([key]), rootActions, rootGetters, rootAction$, rootState$, dependencies);\r\n        outputs.push.apply(outputs, subOutputs);\r\n    }\r\n    var unregisterType = namespaces.join(\"/\") + \"/\" + _action__WEBPACK_IMPORTED_MODULE_3__[\"actionTypes\"].unregister;\r\n    var takeUntil$ = rootAction$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"filter\"])(function (action) { return action.type === unregisterType; }));\r\n    rootAction$ = new redux_observable__WEBPACK_IMPORTED_MODULE_2__[\"ActionsObservable\"](rootAction$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"takeUntil\"])(takeUntil$)));\r\n    rootState$ = new redux_observable__WEBPACK_IMPORTED_MODULE_2__[\"StateObservable\"](rootState$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"takeUntil\"])(takeUntil$)), rootState$.value);\r\n    var state$ = new redux_observable__WEBPACK_IMPORTED_MODULE_2__[\"StateObservable\"](rootState$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"map\"])(function (state) { return Object(_util__WEBPACK_IMPORTED_MODULE_4__[\"getSubObject\"])(state, namespaces); })), Object(_util__WEBPACK_IMPORTED_MODULE_4__[\"getSubObject\"])(rootState$.value, namespaces));\r\n    var actions = Object(_util__WEBPACK_IMPORTED_MODULE_4__[\"getSubObject\"])(rootActions, namespaces);\r\n    var getters = Object(_util__WEBPACK_IMPORTED_MODULE_4__[\"getSubObject\"])(rootGetters, namespaces);\r\n    var _loop_1 = function (key) {\r\n        var effect;\r\n        var operator = rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"mergeMap\"];\r\n        var effectWithOperator = model.effects[key];\r\n        if (Array.isArray(effectWithOperator)) {\r\n            effect = effectWithOperator[0], operator = effectWithOperator[1];\r\n        }\r\n        else {\r\n            effect = effectWithOperator;\r\n        }\r\n        var action$ = rootAction$.ofType(namespaces.concat([key]).join(\"/\"));\r\n        var output$ = action$.pipe(operator(function (action) {\r\n            var payload = action.payload;\r\n            return effect({\r\n                action$: action$,\r\n                rootAction$: rootAction$,\r\n                state$: state$,\r\n                rootState$: rootState$,\r\n                actions: actions,\r\n                rootActions: rootActions,\r\n                getters: getters,\r\n                rootGetters: rootGetters,\r\n                dependencies: dependencies\r\n            }, payload);\r\n        }));\r\n        outputs.push(output$);\r\n    };\r\n    for (var _b = 0, _c = Object.keys(model.effects); _b < _c.length; _b++) {\r\n        var key = _c[_b];\r\n        _loop_1(key);\r\n    }\r\n    var namespacePrefix = namespaces.join(\"/\");\r\n    for (var _d = 0, _e = model.epics; _d < _e.length; _d++) {\r\n        var epic = _e[_d];\r\n        var action$ = new redux_observable__WEBPACK_IMPORTED_MODULE_2__[\"ActionsObservable\"](rootAction$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"filter\"])(function (action) { return action.type.lastIndexOf(namespacePrefix, 0) === 0; })));\r\n        var output$ = epic({\r\n            action$: action$,\r\n            rootAction$: rootAction$,\r\n            state$: state$,\r\n            rootState$: rootState$,\r\n            actions: actions,\r\n            rootActions: rootActions,\r\n            getters: getters,\r\n            rootGetters: rootGetters,\r\n            dependencies: dependencies\r\n        });\r\n        outputs.push(output$);\r\n    }\r\n    return outputs;\r\n}\r\nfunction createModelRootEpic(model, namespaces, actions, getters, dependencies, options) {\r\n    return function (action$, state$) {\r\n        return rxjs__WEBPACK_IMPORTED_MODULE_0__[\"merge\"].apply(void 0, registerModelEpics(model, namespaces, actions, getters, action$, state$, dependencies).map(function (epic) {\r\n            return options.errorHandler != null\r\n                ? epic.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"catchError\"])(function (err, caught) { return options.errorHandler(err, caught); }))\r\n                : epic;\r\n        }));\r\n    };\r\n}\r\nfunction asyncEffect(asyncFn) {\r\n    return new rxjs__WEBPACK_IMPORTED_MODULE_0__[\"Observable\"](function (subscribe) {\r\n        var dispatch = function (action) {\r\n            subscribe.next(action);\r\n            return action;\r\n        };\r\n        asyncFn(dispatch).then(function () { return subscribe.complete(); }, function (reason) { return subscribe.error(reason); });\r\n    });\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/epic.js?");

/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/*! exports provided: asyncEffect, createModelFactoryCreator, createStoreHelperFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _epic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./epic */ \"./lib/epic.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"asyncEffect\", function() { return _epic__WEBPACK_IMPORTED_MODULE_0__[\"asyncEffect\"]; });\n\n/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model */ \"./lib/model.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createModelFactoryCreator\", function() { return _model__WEBPACK_IMPORTED_MODULE_1__[\"createModelFactoryCreator\"]; });\n\n/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./store */ \"./lib/store.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createStoreHelperFactory\", function() { return _store__WEBPACK_IMPORTED_MODULE_2__[\"createStoreHelperFactory\"]; });\n\n\r\n\r\n\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/index.js?");

/***/ }),

/***/ "./lib/model.js":
/*!**********************!*\
  !*** ./lib/model.js ***!
  \**********************/
/*! exports provided: ModelFactory, createModelFactoryCreator, cloneModel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ModelFactory\", function() { return ModelFactory; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createModelFactoryCreator\", function() { return createModelFactoryCreator; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cloneModel\", function() { return cloneModel; });\n/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! reselect */ \"./node_modules/reselect/lib/index.js\");\n/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(reselect__WEBPACK_IMPORTED_MODULE_0__);\nvar __assign = (undefined && undefined.__assign) || Object.assign || function(t) {\r\n    for (var s, i = 1, n = arguments.length; i < n; i++) {\r\n        s = arguments[i];\r\n        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\r\n            t[p] = s[p];\r\n    }\r\n    return t;\r\n};\r\n\r\nvar ModelFactory = /** @class */ (function () {\r\n    function ModelFactory(state) {\r\n        this._selectors = {};\r\n        this._reducers = {};\r\n        this._effects = {};\r\n        this._epics = [];\r\n        this._models = {};\r\n        this._state = state;\r\n    }\r\n    ModelFactory.prototype.selectors = function (selectors) {\r\n        if (typeof selectors === \"function\") {\r\n            selectors = selectors(reselect__WEBPACK_IMPORTED_MODULE_0__[\"createSelector\"]);\r\n        }\r\n        this._selectors = __assign({}, this._selectors, selectors);\r\n        return this;\r\n    };\r\n    ModelFactory.prototype.reducers = function (reducers) {\r\n        this._reducers = __assign({}, this._reducers, reducers);\r\n        return this;\r\n    };\r\n    ModelFactory.prototype.effects = function (effects) {\r\n        this._effects = __assign({}, this._effects, effects);\r\n        return this;\r\n    };\r\n    ModelFactory.prototype.epics = function (epics) {\r\n        this._epics = this._epics.concat(epics);\r\n        return this;\r\n    };\r\n    ModelFactory.prototype.models = function (models) {\r\n        this._models = __assign({}, this._models, models);\r\n        return this;\r\n    };\r\n    ModelFactory.prototype.create = function () {\r\n        return {\r\n            state: this._state,\r\n            selectors: __assign({}, this._selectors),\r\n            reducers: __assign({}, this._reducers),\r\n            effects: __assign({}, this._effects),\r\n            epics: this._epics.slice(),\r\n            models: __assign({}, this._models)\r\n        };\r\n    };\r\n    return ModelFactory;\r\n}());\r\n\r\nfunction createModelFactory(state) {\r\n    return new ModelFactory(state);\r\n}\r\nfunction createModelFactoryCreator() {\r\n    return createModelFactory;\r\n}\r\nfunction cloneModel(model) {\r\n    return {\r\n        state: model.state,\r\n        selectors: __assign({}, model.selectors),\r\n        reducers: __assign({}, model.reducers),\r\n        effects: __assign({}, model.effects),\r\n        epics: model.epics.slice(),\r\n        models: __assign({}, model.models)\r\n    };\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/model.js?");

/***/ }),

/***/ "./lib/reducer.js":
/*!************************!*\
  !*** ./lib/reducer.js ***!
  \************************/
/*! exports provided: createModelReducer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createModelReducer\", function() { return createModelReducer; });\n/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immer */ \"immer\");\n/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immer__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state */ \"./lib/state.js\");\n/* harmony import */ var _action__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./action */ \"./lib/action.js\");\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util */ \"./lib/util.js\");\n\r\n\r\n\r\n\r\nfunction createModelReducer(model, dependencies) {\r\n    return (function (state, action) {\r\n        state = Object(_state__WEBPACK_IMPORTED_MODULE_1__[\"initializeModelState\"])(state, model, dependencies);\r\n        return immer__WEBPACK_IMPORTED_MODULE_0___default()(state, function (draft) {\r\n            var namespaces = action.type.split(\"/\");\r\n            var stateName = namespaces[namespaces.length - 2];\r\n            var actionType = namespaces[namespaces.length - 1];\r\n            var parentState = Object(_util__WEBPACK_IMPORTED_MODULE_3__[\"getSubObject\"])(draft, namespaces.slice(0, namespaces.length - 2));\r\n            var subModel = Object(_util__WEBPACK_IMPORTED_MODULE_3__[\"getSubObject\"])(model, namespaces.slice(0, namespaces.length - 1), function (o, p) { return o.models[p]; });\r\n            if (actionType === _action__WEBPACK_IMPORTED_MODULE_2__[\"actionTypes\"].unregister) {\r\n                if (parentState != null) {\r\n                    delete parentState[stateName];\r\n                }\r\n            }\r\n            var subState = parentState != null && stateName != null\r\n                ? parentState[stateName]\r\n                : parentState;\r\n            var subReducer = subModel != null ? subModel.reducers[actionType] : undefined;\r\n            if (subReducer != null) {\r\n                if (subState == null) {\r\n                    throw new Error(\"Failed to handle action: state must be initialized\");\r\n                }\r\n                var nextSubState = subReducer(subState, action.payload, dependencies);\r\n                if (nextSubState !== undefined) {\r\n                    if (stateName != null) {\r\n                        parentState[stateName] = nextSubState;\r\n                    }\r\n                    else {\r\n                        return nextSubState;\r\n                    }\r\n                }\r\n            }\r\n        });\r\n    });\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/reducer.js?");

/***/ }),

/***/ "./lib/selector.js":
/*!*************************!*\
  !*** ./lib/selector.js ***!
  \*************************/
/*! exports provided: createModelGetters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createModelGetters\", function() { return createModelGetters; });\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ \"./lib/util.js\");\n\r\nfunction createModelGetters(model, getState, dependencies, namespaces, rootGetters) {\r\n    if (rootGetters == null && namespaces.length > 0) {\r\n        throw new Error(\"rootGetters is required for creating sub model getters\");\r\n    }\r\n    var getters = {};\r\n    if (rootGetters == null) {\r\n        rootGetters = getters;\r\n    }\r\n    var _loop_1 = function (key) {\r\n        Object.defineProperty(getters, key, {\r\n            get: function () {\r\n                var rootState = getState();\r\n                var state = Object(_util__WEBPACK_IMPORTED_MODULE_0__[\"getSubObject\"])(rootState, namespaces);\r\n                return model.selectors[key]({\r\n                    state: state,\r\n                    rootState: rootState,\r\n                    getters: getters,\r\n                    rootGetters: rootGetters,\r\n                    dependencies: dependencies\r\n                });\r\n            },\r\n            enumerable: true,\r\n            configurable: true\r\n        });\r\n    };\r\n    for (var _i = 0, _a = Object.keys(model.selectors); _i < _a.length; _i++) {\r\n        var key = _a[_i];\r\n        _loop_1(key);\r\n    }\r\n    for (var _b = 0, _c = Object.keys(model.models); _b < _c.length; _b++) {\r\n        var key = _c[_b];\r\n        getters[key] = createModelGetters(model.models[key], getState, dependencies, namespaces.concat([key]), rootGetters);\r\n    }\r\n    return getters;\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/selector.js?");

/***/ }),

/***/ "./lib/state.js":
/*!**********************!*\
  !*** ./lib/state.js ***!
  \**********************/
/*! exports provided: initializeModelState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"initializeModelState\", function() { return initializeModelState; });\nvar __assign = (undefined && undefined.__assign) || Object.assign || function(t) {\r\n    for (var s, i = 1, n = arguments.length; i < n; i++) {\r\n        s = arguments[i];\r\n        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\r\n            t[p] = s[p];\r\n    }\r\n    return t;\r\n};\r\nfunction initializeModelState(state, model, dependencies) {\r\n    if (state === undefined) {\r\n        if (typeof model.state === \"function\") {\r\n            state = model.state(dependencies);\r\n        }\r\n        else {\r\n            state = model.state;\r\n        }\r\n    }\r\n    var mutated = false;\r\n    var subStates = {};\r\n    for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {\r\n        var key = _a[_i];\r\n        var subModel = model.models[key];\r\n        var subState = initializeModelState(state[key], subModel, dependencies);\r\n        if (state[key] !== subState) {\r\n            subStates[key] = subState;\r\n            mutated = true;\r\n        }\r\n    }\r\n    if (mutated) {\r\n        return __assign({}, state, subStates);\r\n    }\r\n    else {\r\n        return state;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/state.js?");

/***/ }),

/***/ "./lib/store.js":
/*!**********************!*\
  !*** ./lib/store.js ***!
  \**********************/
/*! exports provided: StoreHelper, StoreHelperFactory, createStoreHelperFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"StoreHelper\", function() { return StoreHelper; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"StoreHelperFactory\", function() { return StoreHelperFactory; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createStoreHelperFactory\", function() { return createStoreHelperFactory; });\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ \"rxjs\");\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ \"rxjs/operators\");\n/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _action__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./action */ \"./lib/action.js\");\n/* harmony import */ var _selector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./selector */ \"./lib/selector.js\");\n/* harmony import */ var _reducer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./reducer */ \"./lib/reducer.js\");\n/* harmony import */ var _epic__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./epic */ \"./lib/epic.js\");\n/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./model */ \"./lib/model.js\");\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./util */ \"./lib/util.js\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nvar StoreHelper = /** @class */ (function () {\r\n    function StoreHelper(store, model, namespaces, actions, getters, rootGetters, addEpic$, dependencies, options) {\r\n        this._subStoreHelpers = {};\r\n        this._store = store;\r\n        this._model = model;\r\n        this._namespaces = namespaces;\r\n        this._actions = actions;\r\n        this._getters = getters;\r\n        this._rootGetters = rootGetters;\r\n        this._addEpic$ = addEpic$;\r\n        this._dependencies = dependencies;\r\n        this._options = options;\r\n        for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {\r\n            var namespace = _a[_i];\r\n            this._registerSubStoreHelper(namespace);\r\n        }\r\n    }\r\n    Object.defineProperty(StoreHelper.prototype, \"store\", {\r\n        get: function () {\r\n            return this._store;\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(StoreHelper.prototype, \"state\", {\r\n        get: function () {\r\n            return Object(_util__WEBPACK_IMPORTED_MODULE_7__[\"getSubObject\"])(this._store.getState(), this._namespaces);\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(StoreHelper.prototype, \"actions\", {\r\n        get: function () {\r\n            return this._actions;\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(StoreHelper.prototype, \"getters\", {\r\n        get: function () {\r\n            return this._getters;\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    StoreHelper.prototype.namespace = function (namespace) {\r\n        return this._subStoreHelpers[namespace];\r\n    };\r\n    StoreHelper.prototype.registerModel = function (namespace, model) {\r\n        var _this = this;\r\n        if (this._model.models[namespace] != null) {\r\n            throw new Error(\"Failed to register model: model is already registered\");\r\n        }\r\n        var namespaces = this._namespaces.concat([namespace]);\r\n        this._model.models[namespace] = Object(_model__WEBPACK_IMPORTED_MODULE_6__[\"cloneModel\"])(model);\r\n        this._actions[namespace] = Object(_action__WEBPACK_IMPORTED_MODULE_2__[\"createModelActionHelpers\"])(model, namespaces);\r\n        this._getters[namespace] = Object(_selector__WEBPACK_IMPORTED_MODULE_3__[\"createModelGetters\"])(model, function () { return _this._store.getState(); }, this._dependencies, namespaces, this._rootGetters);\r\n        this._addEpic$.next(Object(_epic__WEBPACK_IMPORTED_MODULE_5__[\"createModelRootEpic\"])(model, namespaces, this.actions[namespace], this.getters[namespace], this._dependencies, { errorHandler: this._options.epicErrorHandler }));\r\n        this._store.dispatch({\r\n            type: namespaces.join(\"/\") + \"/\" + _action__WEBPACK_IMPORTED_MODULE_2__[\"actionTypes\"].register\r\n        });\r\n        this._registerSubStoreHelper(namespace);\r\n    };\r\n    StoreHelper.prototype.unregisterModel = function (namespace) {\r\n        if (this._model.models[namespace] == null) {\r\n            throw new Error(\"Failed to unregister model: model is not existing\");\r\n        }\r\n        this._unregisterSubStoreHelper(namespace);\r\n        var namespaces = this._namespaces.concat([namespace]);\r\n        this._store.dispatch({\r\n            type: namespaces.join(\"/\") + \"/\" + _action__WEBPACK_IMPORTED_MODULE_2__[\"actionTypes\"].epicEnd\r\n        });\r\n        this._store.dispatch({\r\n            type: namespaces.join(\"/\") + \"/\" + _action__WEBPACK_IMPORTED_MODULE_2__[\"actionTypes\"].unregister\r\n        });\r\n        delete this._model.models[namespace];\r\n        delete this._actions[namespace];\r\n        delete this._getters[namespace];\r\n    };\r\n    StoreHelper.prototype._registerSubStoreHelper = function (namespace) {\r\n        var _this = this;\r\n        this._subStoreHelpers[namespace] = new StoreHelper(this._store, this._model.models[namespace], this._namespaces.concat([namespace]), this._actions[namespace], this._getters[namespace], this._rootGetters, this._addEpic$, this._dependencies, this._options);\r\n        Object.defineProperty(this, namespace, {\r\n            get: function () {\r\n                return _this.namespace(namespace);\r\n            },\r\n            enumerable: true,\r\n            configurable: true\r\n        });\r\n    };\r\n    StoreHelper.prototype._unregisterSubStoreHelper = function (namespace) {\r\n        delete this[namespace];\r\n        delete this._subStoreHelpers[namespace];\r\n    };\r\n    return StoreHelper;\r\n}());\r\n\r\nvar StoreHelperFactory = /** @class */ (function () {\r\n    function StoreHelperFactory(model, dependencies, options) {\r\n        var _this = this;\r\n        this._model = model;\r\n        this._dependencies = dependencies;\r\n        this._options = options;\r\n        this._reducer = Object(_reducer__WEBPACK_IMPORTED_MODULE_4__[\"createModelReducer\"])(model, dependencies);\r\n        this._actions = Object(_action__WEBPACK_IMPORTED_MODULE_2__[\"createModelActionHelpers\"])(model, []);\r\n        this._getters = Object(_selector__WEBPACK_IMPORTED_MODULE_3__[\"createModelGetters\"])(model, function () { return _this._store.getState(); }, this._dependencies, [], null);\r\n        var initialEpic = Object(_epic__WEBPACK_IMPORTED_MODULE_5__[\"createModelRootEpic\"])(model, [], this._actions, this._getters, dependencies, { errorHandler: this._options.epicErrorHandler });\r\n        this._addEpic$ = new rxjs__WEBPACK_IMPORTED_MODULE_0__[\"BehaviorSubject\"](initialEpic);\r\n        this._epic = function (action$, state$, epicDependencies) {\r\n            return _this._addEpic$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__[\"mergeMap\"])(function (epic) { return epic(action$, state$, epicDependencies); }));\r\n        };\r\n    }\r\n    Object.defineProperty(StoreHelperFactory.prototype, \"reducer\", {\r\n        get: function () {\r\n            return this._reducer;\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(StoreHelperFactory.prototype, \"epic\", {\r\n        get: function () {\r\n            return this._epic;\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    StoreHelperFactory.prototype.create = function (store) {\r\n        if (this._store != null) {\r\n            throw new Error(\"Store helper is already created\");\r\n        }\r\n        this._store = store;\r\n        return new StoreHelper(store, this._model, [], this._actions, this._getters, this._getters, this._addEpic$, this._dependencies, this._options);\r\n    };\r\n    return StoreHelperFactory;\r\n}());\r\n\r\nfunction createStoreHelperFactory(model, dependencies, options) {\r\n    if (options == null) {\r\n        options = {};\r\n    }\r\n    return new StoreHelperFactory(model, dependencies, options);\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/store.js?");

/***/ }),

/***/ "./lib/util.js":
/*!*********************!*\
  !*** ./lib/util.js ***!
  \*********************/
/*! exports provided: getSubObject */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getSubObject\", function() { return getSubObject; });\nfunction getSubObject(obj, paths, map) {\r\n    return paths.reduce(function (o, path) {\r\n        return o != null ? (map ? map(o, path) : o[path]) : undefined;\r\n    }, obj);\r\n}\r\n\n\n//# sourceURL=webpack://redux-typescript-helper/./lib/util.js?");

/***/ }),

/***/ "./node_modules/reselect/lib/index.js":
/*!********************************************!*\
  !*** ./node_modules/reselect/lib/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.__esModule = true;\nexports.defaultMemoize = defaultMemoize;\nexports.createSelectorCreator = createSelectorCreator;\nexports.createStructuredSelector = createStructuredSelector;\nfunction defaultEqualityCheck(a, b) {\n  return a === b;\n}\n\nfunction areArgumentsShallowlyEqual(equalityCheck, prev, next) {\n  if (prev === null || next === null || prev.length !== next.length) {\n    return false;\n  }\n\n  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.\n  var length = prev.length;\n  for (var i = 0; i < length; i++) {\n    if (!equalityCheck(prev[i], next[i])) {\n      return false;\n    }\n  }\n\n  return true;\n}\n\nfunction defaultMemoize(func) {\n  var equalityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultEqualityCheck;\n\n  var lastArgs = null;\n  var lastResult = null;\n  // we reference arguments instead of spreading them for performance reasons\n  return function () {\n    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {\n      // apply arguments instead of spreading for performance.\n      lastResult = func.apply(null, arguments);\n    }\n\n    lastArgs = arguments;\n    return lastResult;\n  };\n}\n\nfunction getDependencies(funcs) {\n  var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;\n\n  if (!dependencies.every(function (dep) {\n    return typeof dep === 'function';\n  })) {\n    var dependencyTypes = dependencies.map(function (dep) {\n      return typeof dep;\n    }).join(', ');\n    throw new Error('Selector creators expect all input-selectors to be functions, ' + ('instead received the following types: [' + dependencyTypes + ']'));\n  }\n\n  return dependencies;\n}\n\nfunction createSelectorCreator(memoize) {\n  for (var _len = arguments.length, memoizeOptions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {\n    memoizeOptions[_key - 1] = arguments[_key];\n  }\n\n  return function () {\n    for (var _len2 = arguments.length, funcs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {\n      funcs[_key2] = arguments[_key2];\n    }\n\n    var recomputations = 0;\n    var resultFunc = funcs.pop();\n    var dependencies = getDependencies(funcs);\n\n    var memoizedResultFunc = memoize.apply(undefined, [function () {\n      recomputations++;\n      // apply arguments instead of spreading for performance.\n      return resultFunc.apply(null, arguments);\n    }].concat(memoizeOptions));\n\n    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.\n    var selector = defaultMemoize(function () {\n      var params = [];\n      var length = dependencies.length;\n\n      for (var i = 0; i < length; i++) {\n        // apply arguments instead of spreading and mutate a local list of params for performance.\n        params.push(dependencies[i].apply(null, arguments));\n      }\n\n      // apply arguments instead of spreading for performance.\n      return memoizedResultFunc.apply(null, params);\n    });\n\n    selector.resultFunc = resultFunc;\n    selector.recomputations = function () {\n      return recomputations;\n    };\n    selector.resetRecomputations = function () {\n      return recomputations = 0;\n    };\n    return selector;\n  };\n}\n\nvar createSelector = exports.createSelector = createSelectorCreator(defaultMemoize);\n\nfunction createStructuredSelector(selectors) {\n  var selectorCreator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createSelector;\n\n  if (typeof selectors !== 'object') {\n    throw new Error('createStructuredSelector expects first argument to be an object ' + ('where each property is a selector, instead received a ' + typeof selectors));\n  }\n  var objectKeys = Object.keys(selectors);\n  return selectorCreator(objectKeys.map(function (key) {\n    return selectors[key];\n  }), function () {\n    for (var _len3 = arguments.length, values = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {\n      values[_key3] = arguments[_key3];\n    }\n\n    return values.reduce(function (composition, value, index) {\n      composition[objectKeys[index]] = value;\n      return composition;\n    }, {});\n  });\n}\n\n//# sourceURL=webpack://redux-typescript-helper/./node_modules/reselect/lib/index.js?");

/***/ }),

/***/ "immer":
/*!************************!*\
  !*** external "immer" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_immer__;\n\n//# sourceURL=webpack://redux-typescript-helper/external_%22immer%22?");

/***/ }),

/***/ "redux-observable":
/*!***********************************!*\
  !*** external "redux-observable" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_redux_observable__;\n\n//# sourceURL=webpack://redux-typescript-helper/external_%22redux-observable%22?");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;\n\n//# sourceURL=webpack://redux-typescript-helper/external_%22rxjs%22?");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_operators__;\n\n//# sourceURL=webpack://redux-typescript-helper/external_%22rxjs/operators%22?");

/***/ })

/******/ });
});