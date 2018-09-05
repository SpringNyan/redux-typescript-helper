import { StateFactory } from "./state";
import { Selectors, SelectorCreator, SelectorsFactory } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epics } from "./epic";
export interface Model<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState, any, any> = Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any> = Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies> = Models<TDependencies>, TDynamicModels extends Models<TDependencies> = Models<TDependencies>> {
    state: StateFactory<TState, TDependencies>;
    selectors: SelectorsFactory<TSelectors, SelectorCreator<TDependencies, TState, any, any>>;
    reducers: TReducers;
    effects: TEffects;
    epics: Epics<TDependencies, TState, any, any, any, any>;
    models: TModels;
}
export declare type Models<TDependencies = any> = {
    [key: string]: Model<TDependencies>;
};
export declare type ExtractDynamicModels<T extends Model> = T extends Model<any, any, any, any, any, any, infer TDynamicModels> ? TDynamicModels : never;
export declare class ModelBuilder<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>, TDynamicModels extends Models<TDependencies>> {
    private readonly _model;
    constructor(model: Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>);
    state(state: TState | ((s: TState) => TState)): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    selectors<T extends Selectors<TDependencies, TState, TSelectors, TModels>>(selectors: T | SelectorsFactory<T, SelectorCreator<TDependencies, TState, TSelectors, TModels>>): ModelBuilder<TDependencies, TState, TSelectors & T, TReducers, TEffects, TModels, TDynamicModels>;
    reducers<T extends Reducers<TDependencies, TState>>(reducers: T): ModelBuilder<TDependencies, TState, TSelectors, TReducers & T, TEffects, TModels, TDynamicModels>;
    effects<T extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>>(effects: T): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects & T, TModels, TDynamicModels>;
    epics(epics: Epics<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    models<T extends Models<TDependencies>>(models: T): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels & T, TDynamicModels>;
    dynamicModels<T extends Models<TDependencies>>(): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels & T>;
    build(): Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    clone(): ModelBuilder<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
}
export declare type ModelBuilderCreator<TDependencies> = <TState>(state: TState | StateFactory<TState, TDependencies>) => ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>;
export declare function createModelBuilderCreator<TDependencies>(): ModelBuilderCreator<TDependencies>;
export declare function cloneModel<TModel extends Model>(model: TModel): TModel;
