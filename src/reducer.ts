import produce from "immer";
import { Reducer as ReduxReducer } from "redux";

import { initializeModelState } from "./state";
import { Action } from "./action";
import { Model } from "./model";

export interface Reducer<TDependencies, TState, TPayload> {
  (
    state: TState,
    payload: TPayload,
    dependencies: TDependencies
  ): void | TState;
}

export interface Reducers<TDependencies, TState> {
  [type: string]: Reducer<TDependencies, TState, any>;
}

export function createModelReducer<
  TDependencies,
  TModel extends Model<TDependencies>
>(model: TModel, dependencies: TDependencies): ReduxReducer<any, Action<any>> {
  return (state: any, action: Action<any>) => {
    state = initializeModelState(state, model, dependencies);

    return produce(state, (draft) => {
      const namespaces = action.type.split("/");

      const parentState = namespaces
        .slice(0, namespaces.length - 2)
        .reduce(
          (obj, namespace) => (obj != null ? obj[namespace] : undefined),
          draft
        );
      const subState =
        namespaces.length > 1 && parentState != null
          ? parentState[namespaces[namespaces.length - 2]]
          : parentState;

      const subModel = namespaces
        .slice(0, namespaces.length - 1)
        .reduce<Model | undefined>(
          (obj, namespace) => (obj != null ? obj.models[namespace] : undefined),
          model
        );
      const subReducer =
        subModel != null
          ? subModel.reducers[namespaces[namespaces.length - 1]]
          : undefined;

      if (subReducer != null) {
        if (subState == null) {
          throw new Error("State must be initialized");
        }

        let nextSubState = subReducer(subState, action, dependencies);
        if (nextSubState !== undefined) {
          if (namespaces.length > 1) {
            parentState[namespaces[namespaces.length - 2]] = nextSubState;
          } else {
            return nextSubState;
          }
        }
      }
    });
  };
}
