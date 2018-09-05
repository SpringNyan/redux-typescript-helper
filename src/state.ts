import { Model, Models } from "./model";
import { StoreHelperDependencies } from "./store";

export type StateFactory<TState, TDependencies> = (
  dependencies: StoreHelperDependencies<TDependencies>
) => TState;

export type ExtractState<
  T extends StateFactory<any, any> | Model<any, any, any, any, any, any, any>
> = T extends
  | StateFactory<infer TState, any>
  | Model<any, infer TState, any, any, any, any, any>
  ? TState
  : never;

export type DeepState<TState, TModels extends Models<any>> = TState &
  ModelsState<TModels>;

export type ModelState<TModel extends Model> = DeepState<
  ExtractState<TModel>,
  TModel["models"]
>;

export type ModelsState<TModels extends Models<any>> = {
  [K in keyof TModels]: TModels[K] extends Model
    ? ModelState<TModels[K]>
    : never
};
