import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { actionTypes, createModelActionHelpers } from "./action";
import { createModelReducer } from "./reducer";
import { createModelEpic } from "./effect";
import { cloneModel } from "./model";
import { getSubObject } from "./util";
var StoreHelper = /** @class */ (function () {
    function StoreHelper(store, model, namespaces, actions, addEpic$, dependencies) {
        this._store = store;
        this._model = model;
        this._namespaces = namespaces;
        this._actions = actions;
        this._addEpic$ = addEpic$;
        this._dependencies = dependencies;
        for (var _i = 0, _a = Object.keys(model.models); _i < _a.length; _i++) {
            var namespace = _a[_i];
            this._registerNamespace(namespace);
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
    StoreHelper.prototype.namespace = function (namespace) {
        return new StoreHelper(this._store, this._model.models[namespace], this._namespaces.concat([namespace]), this._actions[namespace], this._addEpic$, this._dependencies);
    };
    StoreHelper.prototype.registerModel = function (namespace, model) {
        if (this._model.models[namespace] != null) {
            throw new Error("Failed to register model: model is already registered");
        }
        var namespaces = this._namespaces.concat([namespace]);
        this._model.models[namespace] = cloneModel(model);
        // TODO: add action helpers
        this._addEpic$.next(createModelEpic(model, namespaces, this.actions[namespace], this._dependencies));
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.register
        });
        this._registerNamespace(namespace);
    };
    StoreHelper.prototype.unregisterModel = function (namespace) {
        if (this._model.models[namespace] == null) {
            throw new Error("Failed to unregister model: model is not existing");
        }
        this._unregisterNamespace(namespace);
        var namespaces = this._namespaces.concat([namespace]);
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.unregister
        });
        delete this._model.models[namespace];
        // TODO: delete action helpers
    };
    StoreHelper.prototype._registerNamespace = function (namespace) {
        var _this = this;
        Object.defineProperty(this, namespace, {
            get: function () {
                return _this.namespace(namespace);
            },
            configurable: true
        });
    };
    StoreHelper.prototype._unregisterNamespace = function (namespace) {
        delete this[namespace];
    };
    return StoreHelper;
}());
export { StoreHelper };
var StoreHelperFactory = /** @class */ (function () {
    function StoreHelperFactory(model, dependencies) {
        var _this = this;
        this._model = model;
        this._dependencies = dependencies;
        this._reducer = createModelReducer(model, dependencies);
        this._actions = createModelActionHelpers(model, [], function (action) {
            return _this._store.dispatch(action);
        });
        var initialEpic = createModelEpic(model, [], this._actions, dependencies);
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
        return new StoreHelper(store, this._model, [], this._actions, this._addEpic$, this._dependencies);
    };
    return StoreHelperFactory;
}());
export { StoreHelperFactory };
export function createStoreHelperFactory(model, dependencies) {
    return new StoreHelperFactory(model, dependencies);
}
