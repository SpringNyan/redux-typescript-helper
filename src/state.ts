import { Model, Models, ExtractModels } from "./model";
import { StoreHelperDependencies } from "./store";

export type StateFactory<TState = any, TDependencies = any> = (
  dependencies: StoreHelperDependencies<TDependencies>
) => TState;

export type ExtractState<T extends StateFactory | Model> = T extends
  | StateFactory<infer TState, any>
  | Model<any, infer TState, any, any, any, any, any>
  ? TState
  : never;

export type DeepState<TState, TModels extends Models> = TState &
  ModelsState<TModels>;

export type ModelState<TModel extends Model> = DeepState<
  ExtractState<TModel>,
  ExtractModels<TModel>
>;

export type ModelsState<TModels extends Models> = {
  [K in keyof TModels]: TModels[K] extends Model
    ? ModelState<TModels[K]>
    : never
};
