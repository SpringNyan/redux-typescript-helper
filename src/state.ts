import produce from "immer";

import { Model } from "./model";

export type State<TDependencies, TState> =
  | TState
  | ((dependencies: TDependencies) => TState);

export type ExtractState<TModel extends Model> = TModel extends Model<
  any,
  infer TState
>
  ? TState
  : never;

export type ModelState<TModel extends Model> = ExtractState<TModel> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelState<TModel["models"][K]>
      : never
  };

export function initializeModelState<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  state: ModelState<TModel> | undefined,
  model: TModel,
  dependencies: TDependencies
): ModelState<TModel> {
  if (state === undefined) {
    if (typeof model.state === "function") {
      state = model.state(dependencies);
    } else {
      state = model.state;
    }
  }

  return produce(state!, (draft) => {
    for (const key of Object.keys(model.models)) {
      const subModel = model.models[key];
      draft[key] = initializeModelState(draft[key], subModel, dependencies);
    }
  });
}
