import produce from "immer";
import { Reducer as ReduxReducer } from "redux";

import { Action } from "./action";
import { Reducers } from "./reducer";
import { Epics } from "./epic";
import { Model, Models, ExtractModelState } from "./model";

export type StoreState<
  TModel extends Model<any, any, any, any, any>
> = ExtractModelState<TModel> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model<
      any,
      any,
      any,
      any,
      any
    >
      ? StoreState<TModel["models"][K]>
      : never
  };

function createModelState<
  TDependencies,
  TModel extends Model<
    TDependencies,
    any,
    Reducers<any, TDependencies>,
    Epics<any, TDependencies, any, any>,
    Models<TDependencies>
  >
>(model: TModel, dependencies: TDependencies): StoreState<TModel> {
  if (typeof model.state === "function") {
    return model.state(dependencies);
  } else {
    return model.state;
  }
}

function initializeModelState<
  TDependencies,
  TModel extends Model<
    TDependencies,
    any,
    Reducers<any, TDependencies>,
    Epics<any, TDependencies, any, any>,
    Models<TDependencies>
  >
>(
  state: StoreState<TModel> | undefined,
  model: TModel,
  dependencies: TDependencies
): StoreState<TModel> {
  return produce(
    state === undefined ? createModelState(model, dependencies) : state,
    (draft) => {
      for (const key of Object.keys(model.models)) {
        const subModel = model.models[key];
        draft[key] = initializeModelState(draft[key], subModel, dependencies);
      }
    }
  );
}

export function createModelReducer<
  TDependencies,
  TModel extends Model<
    TDependencies,
    any,
    Reducers<any, TDependencies>,
    Epics<any, TDependencies, any, any>,
    Models<TDependencies>
  >
>(model: TModel, dependencies: TDependencies): ReduxReducer<any, Action<any>> {
  return (state: any, action: Action<any>) => {
    state = initializeModelState(state, model, dependencies);
    return produce(state, (draft) => {
      const namespaces = action.type.split("/");

      for (let i = 0; i < namespaces.length - 3; ++i) {
        draft = draft[namespaces[i]];
      }
      const subState =
        namespaces.length > 1
          ? draft[namespaces[namespaces.length - 2]]
          : draft;

      let subModel: Model<
        TDependencies,
        any,
        Reducers<any, TDependencies>,
        Epics<any, TDependencies, any, any>,
        Models<TDependencies>
      > = model;
      for (let i = 0; i < namespaces.length - 2; ++i) {
        subModel = model.models[namespaces[i]];
      }
      const reducer = model.reducers[namespaces[namespaces.length - 1]];

      const nextState = reducer
        ? reducer(subState, action, dependencies)
        : subState;
      if (namespaces.length > 1) {
        draft[namespaces[namespaces.length - 2]] = nextState;
      } else {
        return nextState;
      }
    });
  };
}
