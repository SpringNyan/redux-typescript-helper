import { Model, Models } from "./model";
import { StoreHelperDependencies } from "./store";
export declare type StateFactory<TState, TDependencies> = (dependencies: StoreHelperDependencies<TDependencies>) => TState;
export declare type ExtractState<T extends StateFactory<any, any> | Model> = T extends StateFactory<infer TState, any> | Model<any, infer TState, any, any, any, any, any> ? TState : never;
export declare type DeepState<TState, TModels extends Models<any>> = TState & ModelsState<TModels>;
export declare type ModelState<TModel extends Model> = DeepState<ExtractState<TModel>, TModel["models"]>;
export declare type ModelsState<TModels extends Models<any>> = {
    [K in keyof TModels]: TModels[K] extends Model ? ModelState<TModels[K]> : never;
};
