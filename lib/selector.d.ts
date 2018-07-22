import { Model } from "./model";
export interface SelectorContext<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>> {
    state: TState;
    rootState: any;
    getters: Getters<TSelectors>;
    rootGetters: ModelGetters<any>;
    dependencies: TDependencies;
}
export interface Selector<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TResult> {
    (context: SelectorContext<TDependencies, TState, TSelectors>): TResult;
}
export interface Selectors<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>> {
    [name: string]: Selector<TDependencies, TState, TSelectors, any>;
}
export declare type ExtractSelectorResult<T extends Selector<any, any, any, any>> = T extends Selector<any, any, any, infer TResult> ? TResult : any;
export declare type Getters<T extends Selectors<any, any, any>> = {
    [K in keyof T]: ExtractSelectorResult<T[K]>;
};
export declare type ModelGetters<TModel extends Model> = Getters<TModel["selectors"]> & {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model ? ModelGetters<TModel["models"][K]> : never;
};
export declare function createModelGetters<TDependencies, TModel extends Model<TDependencies>>(model: TModel, namespaces: string[], getState: () => any, rootGetters: ModelGetters<any> | null, dependencies: TDependencies): ModelGetters<TModel>;
