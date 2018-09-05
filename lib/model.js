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
var ModelBuilder = /** @class */ (function () {
    function ModelBuilder(state) {
        this._selectors = function () { return ({}); };
        this._reducers = {};
        this._effects = {};
        this._epics = [];
        this._models = {};
        this._state = this._toFactoryIfNeeded(state);
    }
    ModelBuilder.prototype.selectors = function (selectors) {
        var oldSelectors = this._selectors;
        var newSelectors = this._toFactoryIfNeeded(selectors);
        this._selectors = function (selectorCreator) { return (__assign({}, oldSelectors(selectorCreator), newSelectors(selectorCreator))); };
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
    ModelBuilder.prototype.build = function (state) {
        var _this = this;
        var createState = function (dependencies) {
            var defaultState = _this._state(dependencies);
            return state !== undefined
                ? _this._toFactoryIfNeeded(state)(defaultState)
                : defaultState;
        };
        return {
            state: createState,
            selectors: this._selectors,
            reducers: __assign({}, this._reducers),
            effects: __assign({}, this._effects),
            epics: this._epics.slice(),
            models: __assign({}, this._models)
        };
    };
    ModelBuilder.prototype._toFactoryIfNeeded = function (obj) {
        return typeof obj === "function" ? obj : function () { return obj; };
    };
    return ModelBuilder;
}());
export { ModelBuilder };
function createModelBuilder(state) {
    return new ModelBuilder(state);
}
export function createModelBuilderCreator() {
    return createModelBuilder;
}
