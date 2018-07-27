import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { actionTypes, createModelActionHelpers } from "./action";
import { createModelGetters } from "./selector";
import { createModelReducer } from "./reducer";
import { createModelRootEpic } from "./epic";
import { cloneModel } from "./model";
import { getSubObject } from "./util";
var StoreHelper = /** @class */ (function () {
    function StoreHelper(store, model, namespaces, actions, getters, rootGetters, addEpic$, dependencies, options) {
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
    Object.defineProperty(StoreHelper.prototype, "store", {
        get: function () {
            return this._store;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoreHelper.prototype, "state", {
        get: function () {
            return getSubObject(this._store.getState(), this._namespaces);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoreHelper.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoreHelper.prototype, "getters", {
        get: function () {
            return this._getters;
        },
        enumerable: true,
        configurable: true
    });
    StoreHelper.prototype.namespace = function (namespace) {
        return this._subStoreHelpers[namespace];
    };
    StoreHelper.prototype.registerModel = function (namespace, model) {
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
    StoreHelper.prototype.unregisterModel = function (namespace) {
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
    StoreHelper.prototype._registerSubStoreHelper = function (namespace) {
        var _this = this;
        this._subStoreHelpers[namespace] = new StoreHelper(this._store, this._model.models[namespace], this._namespaces.concat([namespace]), this._actions[namespace], this._getters[namespace], this._rootGetters, this._addEpic$, this._dependencies, this._options);
        Object.defineProperty(this, namespace, {
            get: function () {
                return _this.namespace(namespace);
            },
            enumerable: true,
            configurable: true
        });
    };
    StoreHelper.prototype._unregisterSubStoreHelper = function (namespace) {
        delete this[namespace];
        delete this._subStoreHelpers[namespace];
    };
    return StoreHelper;
}());
export { StoreHelper };
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
        return new StoreHelper(store, this._model, [], this._actions, this._getters, this._getters, this._addEpic$, this._dependencies, this._options);
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
