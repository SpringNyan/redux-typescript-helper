import produce from "immer";
import { Reducer as ReduxReducer } from "redux";

import { initializeModelState } from "./state";
import { Action, actionTypes } from "./action";
import { Model } from "./model";
import { getSubObject } from "./util";

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
>(model: TModel, dependencies: TDependencies): ReduxReducer {
  return ((state: any, action: Action<any>) => {
    state = initializeModelState(state, model, dependencies);

    return produce(state, (draft) => {
      const namespaces = action.type.split("/");
      const stateName = namespaces[namespaces.length - 2];
      const actionType = namespaces[namespaces.length - 1];

      const parentState = getSubObject(
        draft,
        namespaces.slice(0, namespaces.length - 2)
      );

      const subModel = getSubObject<Model>(
        model,
        namespaces.slice(0, namespaces.length - 1),
        (o, p) => o.models[p]
      );

      if (actionType === actionTypes.unregister) {
        if (parentState != null) {
          delete parentState[stateName];
        }
      }

      const subState =
        parentState != null && stateName != null
          ? parentState[stateName]
          : parentState;

      const subReducer =
        subModel != null ? subModel.reducers[actionType] : undefined;

      if (subReducer != null) {
        if (subState == null) {
          throw new Error("Failed to handle action: state must be initialized");
        }

        const nextSubState = subReducer(subState, action.payload, dependencies);
        if (nextSubState !== undefined) {
          if (stateName != null) {
            parentState[stateName] = nextSubState;
          } else {
            return nextSubState;
          }
        }
      }
    });
  }) as ReduxReducer;
}
