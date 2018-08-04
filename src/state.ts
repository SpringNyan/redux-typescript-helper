import { Model } from "./model";
import { StoreHelperDependencies } from "./store";

export type State<TDependencies, TState> =
  | TState
  | ((dependencies: StoreHelperDependencies<TDependencies>) => TState);

export type ExtractState<T extends State<any, any> | Model> = T extends
  | State<any, infer TState>
  | Model<any, infer TState>
  ? TState
  : never;

export type ModelState<TModel extends Model> = ExtractState<TModel> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelState<TModel["models"][K]>
      : never
  };
