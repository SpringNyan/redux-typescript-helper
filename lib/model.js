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
import { createSelector } from "reselect";
var ModelFactory = /** @class */ (function () {
    function ModelFactory(state) {
        this._selectors = {};
        this._reducers = {};
        this._effects = {};
        this._epics = [];
        this._models = {};
        this._state = state;
    }
    ModelFactory.prototype.dynamicModels = function () {
        return this;
    };
    ModelFactory.prototype.selectors = function (selectors) {
        if (typeof selectors === "function") {
            selectors = selectors(createSelector);
        }
        this._selectors = __assign({}, this._selectors, selectors);
        return this;
    };
    ModelFactory.prototype.reducers = function (reducers) {
        this._reducers = __assign({}, this._reducers, reducers);
        return this;
    };
    ModelFactory.prototype.effects = function (effects) {
        this._effects = __assign({}, this._effects, effects);
        return this;
    };
    ModelFactory.prototype.epics = function (epics) {
        this._epics = this._epics.concat(epics);
        return this;
    };
    ModelFactory.prototype.models = function (models) {
        this._models = __assign({}, this._models, models);
        return this;
    };
    ModelFactory.prototype.create = function () {
        return {
            state: this._state,
            selectors: __assign({}, this._selectors),
            reducers: __assign({}, this._reducers),
            effects: __assign({}, this._effects),
            epics: this._epics.slice(),
            models: __assign({}, this._models)
        };
    };
    return ModelFactory;
}());
export { ModelFactory };
function createModelFactory(state) {
    return new ModelFactory(state);
}
export function createModelFactoryCreator() {
    return createModelFactory;
}
