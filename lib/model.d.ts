import { StateFactory } from "./state";
import { Selectors, SelectorCreator, SelectorsFactory } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epics } from "./epic";
import { StoreHelper } from "./store";
export interface Model<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = Selectors<TDependencies, TState>, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState> = Effects<TDependencies, TState>, TModels extends Models<TDependencies> = Models<TDependencies>, TDynamicModels extends Models<TDependencies> = Models<TDependencies>> {
    state: StateFactory<TState, TDependencies>;
    selectors: SelectorsFactory<TSelectors, SelectorCreator<TDependencies, TState>>;
    reducers: TReducers;
    effects: TEffects;
    epics: Epics<TDependencies, TState>;
    models: TModels;
}
export declare type Models<TDependencies = any> = {
    [key: string]: Model<TDependencies>;
};
export declare type ExtractModel<T extends ModelBuilder | StoreHelper<Model>> = T extends ModelBuilder ? ReturnType<T["build"]> : T extends StoreHelper<infer TModel> ? TModel : never;
export declare type ExtractDynamicModels<T extends Model> = T extends Model<any, any, any, any, any, any, infer TDynamicModels> ? TDynamicModels : never;
export declare class ModelBuilder<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = Selectors<TDependencies, TState>, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState> = Effects<TDependencies, TState>, TModels extends Models<TDependencies> = Models<TDependencies>, TDynamicModels extends Models<TDependencies> = Models<TDependencies>> {
    private readonly _model;
    private _isFrozen;
    constructor(model: Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>);
    state(state: TState | ((s: TState) => TState)): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    selectors<T extends Selectors<TDependencies, TState, TSelectors, TModels, TDynamicModels>>(selectors: T | SelectorsFactory<T, SelectorCreator<TDependencies, TState, TSelectors, TModels, TDynamicModels>>): ModelBuilder<TDependencies, TState, TSelectors & T, TReducers, TEffects, TModels, TDynamicModels>;
    reducers<T extends Reducers<TDependencies, TState>>(reducers: T): ModelBuilder<TDependencies, TState, TSelectors, TReducers & T, TEffects, TModels, TDynamicModels>;
    effects<T extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>>(effects: T): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects & T, TModels, TDynamicModels>;
    epics(epics: Epics<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    models<T extends Models<TDependencies>>(models: T): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels & T, TDynamicModels>;
    dynamicModels<T extends Models<TDependencies>>(): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels & T>;
    build(): Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    clone(): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    freeze(): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
}
export declare type ModelBuilderCreator<TDependencies> = <TState>(state: TState | StateFactory<TState, TDependencies>) => ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>;
export declare function createModelBuilderCreator<TDependencies>(): ModelBuilderCreator<TDependencies>;
export declare function cloneModel<TModel extends Model>(model: TModel): TModel;
