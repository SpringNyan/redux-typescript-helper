import { Model } from "./model";
export interface Selector<TDependencies, TState, TResult> {
    (state: TState, dependencies: TDependencies): TResult;
}
export interface Selectors<TDependencies, TState> {
    [name: string]: Selector<TDependencies, TState, any>;
}
export declare type ExtractSelectorResult<T extends Selector<any, any, any>> = T extends Selector<any, any, infer TResult> ? TResult : any;
export declare type Getters<T extends Selectors<any, any>> = {
    [K in keyof T]: ExtractSelectorResult<T[K]>;
};
export declare type ModelGetters<TModel extends Model> = Getters<TModel["selectors"]> & {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model ? ModelGetters<TModel["models"][K]> : never;
};
export declare function createModelGetters<TDependencies, TModel extends Model<TDependencies>>(model: TModel, namespaces: string[], getState: () => any, dependencies: TDependencies): ModelGetters<TModel>;
