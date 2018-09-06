import produce from "immer";
import { Action as ReduxAction, Reducer as ReduxReducer } from "redux";

import { ModelState } from "./state";
import { Action, actionTypes } from "./action";
import { Model } from "./model";
import { StoreHelperDependencies } from "./store";
import { getIn } from "./util";

export interface Reducer<TDependencies = any, TState = any, TPayload = any> {
  (
    state: TState,
    payload: TPayload,
    dependencies: StoreHelperDependencies<TDependencies>
  ): void | TState;
}

export interface Reducers<TDependencies = any, TState = any> {
  [type: string]: Reducer<TDependencies, TState>;
}

export function createModelReducer<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>
): ReduxReducer {
  return (rootState: any, action: ReduxAction) => {
    rootState = initializeModelState(rootState, model, dependencies);

    return produce(rootState, (rootDraft) => {
      const namespaces = action.type.split("/");

      const parentState = getIn(
        rootDraft,
        namespaces.slice(0, namespaces.length - 2)
      );

      const targetModel = getIn<Model>(
        model,
        namespaces.slice(0, namespaces.length - 1),
        (obj, key) => obj.models[key]
      );

      const stateName = namespaces[namespaces.length - 2];
      const actionType = namespaces[namespaces.length - 1];

      if (actionType === actionTypes.unregister) {
        if (parentState != null && stateName != null) {
          delete parentState[stateName];
        }
      }

      const targetState =
        parentState != null && stateName != null
          ? parentState[stateName]
          : undefined;

      const targetReducer =
        targetModel != null ? targetModel.reducers[actionType] : undefined;

      if (targetReducer != null) {
        if (parentState == null || stateName == null) {
          throw new Error("state not found");
        }

        const nextTargetState = targetReducer(
          targetState,
          (action as Action).payload,
          dependencies
        );

        if (nextTargetState !== undefined) {
          parentState[stateName] = nextTargetState;
        }
      }
    });
  };
}

function initializeModelState<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  state: ModelState<TModel> | undefined,
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>
): ModelState<TModel> {
  if (state === undefined) {
    state = model.state(dependencies);
  }

  let mutated = false;
  const subStates: { [key: string]: any } = {};
  for (const key of Object.keys(model.models)) {
    const subModel = model.models[key];
    const subState = initializeModelState(state![key], subModel, dependencies);
    if (state![key] !== subState) {
      subStates[key] = subState;
      mutated = true;
    }
  }

  if (mutated) {
    return {
      ...(state as { [key: string]: any }),
      ...subStates
    } as ModelState<TModel>;
  } else {
    return state!;
  }
}
