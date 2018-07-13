import { State } from "./state";
import { Reducers } from "./reducer";
import { Effects } from "./effect";
export interface Model<TDependencies = any, TState = any, TReducers extends Reducers<TDependencies, TState> = Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TReducers, TEffects> = Effects<TDependencies, TState, any, any>, TModels extends Models<TDependencies> = Models<TDependencies>> {
    state: State<TDependencies, TState>;
    reducers: TReducers;
    effects: TEffects;
    models: TModels;
}
export declare type Models<TDependencies> = {
    [key: string]: Model<TDependencies>;
};
export declare class ModelFactory<TDependencies, TState, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any>, TModels extends Models<TDependencies>> {
    private readonly _state;
    private _reducers;
    private _effects;
    private _models;
    constructor(state: State<TDependencies, TState>);
    reducers<T extends Reducers<TDependencies, TState>>(reducers: T): ModelFactory<TDependencies, TState, TReducers & T, TEffects, TModels>;
    effects<T extends Effects<TDependencies, TState, TReducers, TEffects>>(effects: T): ModelFactory<TDependencies, TState, TReducers, TEffects & T, TModels>;
    models<T extends Models<TDependencies>>(models: T): ModelFactory<TDependencies, TState, TReducers, TEffects, TModels & T>;
    create(): Model<TDependencies, TState, TReducers, TEffects, TModels>;
}
export declare type ModelFactoryCreator<TDependencies> = <TState>(state: TState) => ModelFactory<TDependencies, TState, {}, {}, {}>;
export declare function createModelFactoryCreator<TDependencies>(): ModelFactoryCreator<TDependencies>;
export declare function cloneModel<TModel extends Model>(model: TModel): TModel;
