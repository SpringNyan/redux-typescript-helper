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
    function ModelBuilder(model) {
        this._model = cloneModel(model);
    }
    ModelBuilder.prototype.state = function (state) {
        var oldState = this._model.state;
        var newState = toFactoryIfNeeded(state);
        this._model.state = function (dependencies) { return newState(oldState(dependencies)); };
        return this;
    };
    ModelBuilder.prototype.selectors = function (selectors) {
        var oldSelectors = this._model.selectors;
        var newSelectors = toFactoryIfNeeded(selectors);
        this._model.selectors = function (selectorCreator) { return (__assign({}, oldSelectors(selectorCreator), newSelectors(selectorCreator))); };
        return this;
    };
    ModelBuilder.prototype.reducers = function (reducers) {
        this._model.reducers = __assign({}, this._model.reducers, reducers);
        return this;
    };
    ModelBuilder.prototype.effects = function (effects) {
        this._model.effects = __assign({}, this._model.effects, effects);
        return this;
    };
    ModelBuilder.prototype.epics = function (epics) {
        this._model.epics = this._model.epics.concat(epics);
        return this;
    };
    ModelBuilder.prototype.models = function (models) {
        this._model.models = __assign({}, this._model.models, models);
        return this;
    };
    ModelBuilder.prototype.dynamicModels = function () {
        return this;
    };
    ModelBuilder.prototype.build = function () {
        return cloneModel(this._model);
    };
    ModelBuilder.prototype.clone = function () {
        return new ModelBuilder(this._model);
    };
    return ModelBuilder;
}());
export { ModelBuilder };
function toFactoryIfNeeded(obj) {
    return typeof obj === "function" ? obj : function () { return obj; };
}
function createModel(state) {
    return {
        state: toFactoryIfNeeded(state),
        selectors: function () { return ({}); },
        reducers: {},
        effects: {},
        epics: [],
        models: {}
    };
}
function createModelBuilder(state) {
    return new ModelBuilder(createModel(state));
}
export function createModelBuilderCreator() {
    return createModelBuilder;
}
export function cloneModel(model) {
    return {
        state: model.state,
        selectors: model.selectors,
        reducers: __assign({}, model.reducers),
        effects: __assign({}, model.effects),
        epics: model.epics.slice(),
        models: __assign({}, model.models)
    };
}
