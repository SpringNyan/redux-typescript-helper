import { State } from "./state";
import { Selectors, SelectorCreator } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epic } from "./epic";
export interface Model<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState, any, any> = Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any> = Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies> = Models<TDependencies>, TDynamicModels extends Models<TDependencies> = Models<TDependencies>> {
    state: State<TDependencies, TState>;
    selectors: TSelectors;
    reducers: TReducers;
    effects: TEffects;
    epics: Array<Epic<TDependencies, TState, any, any, any, any>>;
    models: TModels;
}
export declare type Models<TDependencies> = {
    [key: string]: Model<TDependencies>;
};
export declare type ExtractDynamicModels<T extends Model<any, any, any, any, any, any, any>> = T extends Model<any, any, any, any, any, any, infer TDynamicModels> ? TDynamicModels : never;
export declare class ModelFactory<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>, TDynamicModels extends Models<TDependencies>> {
    private readonly _state;
    private _selectors;
    private _reducers;
    private _effects;
    private _epics;
    private _models;
    constructor(state: State<TDependencies, TState>);
    dynamicModels<T extends Models<TDependencies>>(): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, T>;
    selectors<T extends Selectors<TDependencies, TState, TSelectors, TModels>>(selectors: T | ((selectorCreator: SelectorCreator<TDependencies, TState, TSelectors, TModels>) => T)): ModelFactory<TDependencies, TState, TSelectors & T, TReducers, TEffects, TModels, TDynamicModels>;
    reducers<T extends Reducers<TDependencies, TState>>(reducers: T): ModelFactory<TDependencies, TState, TSelectors, TReducers & T, TEffects, TModels, TDynamicModels>;
    effects<T extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>>(effects: T): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects & T, TModels, TDynamicModels>;
    epics(epics: Array<Epic<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>>): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
    models<T extends Models<TDependencies>>(models: T): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels & T, TDynamicModels>;
    create(): Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
}
export declare type ModelFactoryCreator<TDependencies> = <TState>(state: State<TDependencies, TState>) => ModelFactory<TDependencies, TState, {}, {}, {}, {}, {}>;
export declare function createModelFactoryCreator<TDependencies>(): ModelFactoryCreator<TDependencies>;
