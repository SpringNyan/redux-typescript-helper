import { Model, Models, ExtractModels } from "./model";
import { StoreHelperDependencies } from "./store";
export declare type StateFactory<TState = any, TDependencies = any> = (dependencies: StoreHelperDependencies<TDependencies>) => TState;
export declare type ExtractState<T extends StateFactory | Model> = T extends StateFactory<infer TState, any> | Model<any, infer TState, any, any, any, any, any> ? TState : never;
export declare type DeepState<TState, TModels extends Models> = TState & ModelsState<TModels>;
export declare type ModelState<TModel extends Model> = DeepState<ExtractState<TModel>, ExtractModels<TModel>>;
export declare type ModelsState<TModels extends Models> = {
    [K in keyof TModels]: ModelState<TModels[K]>;
};
