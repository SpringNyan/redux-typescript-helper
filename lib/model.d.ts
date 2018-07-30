import { State } from "./state";
import { Selectors, SelectorCreator } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epic } from "./epic";
export interface Model<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState, TSelectors> = Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects> = Effects<TDependencies, TState, any, any, any>, TModels extends Models<TDependencies> = Models<TDependencies>> {
    state: State<TDependencies, TState>;
    selectors: TSelectors;
    reducers: TReducers;
    effects: TEffects;
    epics: Array<Epic<TDependencies, TState, any, any, any>>;
    models: TModels;
}
export declare type Models<TDependencies> = {
    [key: string]: Model<TDependencies>;
};
export declare class ModelFactory<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any>, TModels extends Models<TDependencies>> {
    private readonly _state;
    private _selectors;
    private _reducers;
    private _effects;
    private _epics;
    private _models;
    constructor(state: State<TDependencies, TState>);
    selectors<T extends Selectors<TDependencies, TState, TSelectors>>(selectors: T | ((selectorCreator: SelectorCreator<TDependencies, TState, TSelectors>) => T)): ModelFactory<TDependencies, TState, TSelectors & T, TReducers, TEffects, TModels>;
    reducers<T extends Reducers<TDependencies, TState>>(reducers: T): ModelFactory<TDependencies, TState, TSelectors, TReducers & T, TEffects, TModels>;
    effects<T extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects>>(effects: T): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects & T, TModels>;
    epics(epics: Array<Epic<TDependencies, TState, TSelectors, TReducers, TEffects>>): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>;
    models<T extends Models<TDependencies>>(models: T): ModelFactory<TDependencies, TState, TSelectors, TReducers, TEffects, TModels & T>;
    create(): Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>;
}
export declare type ModelFactoryCreator<TDependencies> = <TState>(state: State<TDependencies, TState>) => ModelFactory<TDependencies, TState, {}, {}, {}, {}>;
export declare function createModelFactoryCreator<TDependencies>(): ModelFactoryCreator<TDependencies>;
export declare function cloneModel<TModel extends Model>(model: TModel): TModel;
