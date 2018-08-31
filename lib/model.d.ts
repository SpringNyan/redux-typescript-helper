import { State } from "./state";
import { Selectors, SelectorCreator } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epic } from "./epic";
export interface Model<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState, any, any> = Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any> = Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies> = Models<TDependencies>, TDynamicModel extends Model<TDependencies> | never = never> {
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
export declare type ExtractDynamicModel<TModel extends Model<any, any, any, any, any, any, any>> = TModel extends Model<any, any, any, any, any, any, infer TDynamicModel> ? TDynamicModel : never;
export declare class ModelFactory<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>, TDynamicModel extends Model<TDependencies> | never> {
    private readonly _state;
    private _selectors;
    private _reducers;
    private _effects;
    private _epics;
    private _models;
    constructor(state: State<TDependencies, TState>);
    dynamicModel<T extends Model<TDependencies> = Model<TDependencies, unknown, {}, {}, {}, {}, never>>(): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, T>;
    selectors<T extends Selectors<TDependencies, TState, TSelectors, TModels>>(selectors: T | ((selectorCreator: SelectorCreator<TDependencies, TState, TSelectors, TModels>) => T)): ModelFactory<TDependencies, TState, TSelectors & T, TReducers, TEffects, TModels, TDynamicModel>;
    reducers<T extends Reducers<TDependencies, TState>>(reducers: T): ModelFactory<TDependencies, TState, TSelectors, TReducers & T, TEffects, TModels, TDynamicModel>;
    effects<T extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>>(effects: T): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects & T, TModels, TDynamicModel>;
    epics(epics: Array<Epic<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>>): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModel>;
    models<T extends Models<TDependencies>>(models: T): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels & T, TDynamicModel>;
    create(): Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModel>;
}
export declare type ModelFactoryCreator<TDependencies> = <TState>(state: State<TDependencies, TState>) => ModelFactory<TDependencies, TState, {}, {}, {}, {}, never>;
export declare function createModelFactoryCreator<TDependencies>(): ModelFactoryCreator<TDependencies>;
