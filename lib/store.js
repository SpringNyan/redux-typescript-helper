import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { actionTypes, createModelActionHelpers } from "./action";
import { createModelReducer } from "./reducer";
import { createModelGetters } from "./selector";
import { createModelEpic } from "./epic";
import { getIn } from "./util";
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
        this._reducer = createModelReducer(this._model, this._dependencies);
        this._actions = createModelActionHelpers(this._model, [], null);
        this._getters = createModelGetters(this._model, this._dependencies, [], null);
        var initialEpic = createModelEpic(model, this._dependencies, this._options.epicErrorHandler || null, []);
        this._addEpic$ = new BehaviorSubject(initialEpic);
        this._epic = function (action$, state$, epicDependencies) {
            return _this._addEpic$.pipe(mergeMap(function (epic) { return epic(action$, state$, epicDependencies); }));
        };
        this._storeHelper = new _StoreHelper(this._model, this._dependencies, this._options, this._actions, this._getters, this._addEpic$, [], null);
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
        this._dependencies.$storeHelper = this._storeHelper;
        return this._storeHelper;
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
    function _StoreHelper(model, dependencies, options, actions, getters, addEpic$, namespaces, parent) {
        this._subStoreHelpers = {};
        this._model = model;
        this._dependencies = dependencies;
        this._options = options;
        this._actions = actions;
        this._getters = getters;
        this._addEpic$ = addEpic$;
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
        this._actions[namespace] = createModelActionHelpers(model, namespaces, this._actions);
        this._getters[namespace] = createModelGetters(model, this._dependencies, namespaces, this._getters);
        this._registerSubStoreHelper(namespace);
        this._addEpic$.next(createModelEpic(model, this._dependencies, this._options.epicErrorHandler || null, namespaces));
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
        this._store.dispatch({
            type: namespaces.join("/") + "/" + actionTypes.unregister
        });
        this._unregisterSubStoreHelper(namespace);
        delete this._model.models[namespace];
        delete this._actions[namespace];
        delete this._getters[namespace];
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
        this._subStoreHelpers[namespace] = new _StoreHelper(this._model.models[namespace], this._dependencies, this._options, this._actions[namespace], this._getters[namespace], this._addEpic$, this._namespaces.concat([namespace]), this);
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
