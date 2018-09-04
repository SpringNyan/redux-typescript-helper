import { Model, Models } from "./model";
import { StoreHelperDependencies } from "./store";
export declare type StateFactory<TState, TDependencies> = (dependencies: StoreHelperDependencies<TDependencies>) => TState;
export declare type ExtractState<T extends StateFactory<any, any> | Model<any, any, any, any, any, any, any>> = T extends StateFactory<infer TState, any> | Model<any, infer TState, any, any, any, any, any> ? TState : never;
export declare type ModelState<TModel extends Model<any, any, any, any, any, any, any>> = ExtractState<TModel> & ModelsState<TModel["models"]>;
export declare type ModelsState<TModels extends Models<any>> = {
    [K in keyof TModels]: TModels[K] extends Model<any, any, any, any, any, any, any> ? ModelState<TModels[K]> : never;
};
