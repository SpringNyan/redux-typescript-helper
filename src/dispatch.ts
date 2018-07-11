import { Dispatch as ReduxDispatch } from "redux";

import { Action, ExtractActionPayload } from "./action";
import { Reducers } from "./reducer";
import { Epics } from "./epic";
import { Model } from "./model";

export interface DispatchHelper<TPayload> {
  (payload: TPayload): Action<TPayload>;
  type: string;
  is(action: Action<any>): action is Action<TPayload>;
}

export type Dispatch<
  T extends Reducers<any, any> | Epics<any, any, any, any>
> = { [K in keyof T]: DispatchHelper<ExtractActionPayload<T[K]>> };

export type ModelDispatch<TModel extends Model> = Dispatch<
  TModel["reducers"] & TModel["epics"]
> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelDispatch<TModel["models"][K]>
      : never
  };

function createDispatchHelper<TPayload>(
  type: string,
  dispatch?: ReduxDispatch
): DispatchHelper<TPayload> {
  const fn = ((payload: TPayload): Action<TPayload> => {
    const action = {
      type,
      payload
    };

    if (dispatch) {
      return dispatch(action);
    } else {
      return action;
    }
  }) as DispatchHelper<TPayload>;

  fn.type = type;
  fn.is = (action: Action<any>): action is Action<TPayload> =>
    action.type === type;

  return fn;
}

export function createModelDispatch<TModel extends Model>(
  model: TModel,
  namespaces: string[],
  dispatch?: ReduxDispatch
): ModelDispatch<TModel> {
  return new Proxy(
    {},
    {
      get(_target, key: string) {
        if (key in model.reducers || key in model.epics) {
          return createDispatchHelper([...namespaces, key].join("/"), dispatch);
        } else if (key in model.models) {
          return createModelDispatch(
            model.models[key],
            [...namespaces, key],
            dispatch
          );
        } else {
          return undefined;
        }
      }
    }
  ) as any;
}
