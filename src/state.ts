import { Model, Models } from "./model";
import { StoreHelperDependencies } from "./store";

export type State<TDependencies, TState> =
  | TState
  | ((dependencies: StoreHelperDependencies<TDependencies>) => TState);

export type ExtractState<
  T extends State<any, any> | Model<any, any, any, any, any, any>
> = T extends
  | State<any, infer TState>
  | Model<any, infer TState, any, any, any, any>
  ? TState
  : never;

export type ModelState<
  TModel extends Model<any, any, any, any, any, any>
> = ExtractState<TModel> & ModelsState<TModel["models"]>;

export type ModelsState<TModels extends Models<any>> = {
  [K in keyof TModels]: TModels[K] extends Model<any, any, any, any, any, any>
    ? ModelState<TModels[K]>
    : never
};
