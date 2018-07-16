import { Dispatch } from "redux";

import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./effect";
import { Model } from "./model";

export const actionTypes = {
  register: "@@REGISTER",
  unregister: "@@UNREGISTER"
};

export interface Action<TPayload> {
  type: string;
  payload: TPayload;
}

export type ExtractActionPayload<
  T extends
    | Reducer<any, any, any>
    | Effect<any, any, any, any, any>
    | EffectWithOperator<any, any, any, any, any>
> = T extends
  | Reducer<any, any, infer TPayload>
  | Effect<any, any, any, any, infer TPayload>
  | EffectWithOperator<any, any, any, any, infer TPayload>
  ? TPayload
  : any;

export class ActionHelper<TPayload> {
  public readonly type: string;
  private readonly _dispatch: Dispatch;

  constructor(type: string, dispatch: Dispatch) {
    this.type = type;
    this._dispatch = dispatch;
  }

  public create(payload: TPayload): Action<TPayload> {
    return {
      type: this.type,
      payload
    };
  }

  public dispatch(payload: TPayload): Action<TPayload> {
    return this._dispatch(this.create(payload));
  }

  public is(action: any): action is Action<TPayload> {
    return action.type === this.type;
  }
}

export type ActionHelpers<
  T extends Reducers<any, any> | Effects<any, any, any, any>
> = { [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>> };

export type ModelActionHelpers<TModel extends Model> = ActionHelpers<
  TModel["reducers"] & TModel["effects"]
> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelActionHelpers<TModel["models"][K]>
      : never
  };

export function createModelActionHelpers<TModel extends Model>(
  model: TModel,
  namespaces: string[],
  dispatch: Dispatch
): ModelActionHelpers<TModel> {
  return new Proxy(
    {},
    {
      get(_target, key: string) {
        if (key in model.reducers || key in model.effects) {
          return new ActionHelper([...namespaces, key].join("/"), dispatch);
        } else if (key in model.models) {
          return createModelActionHelpers(
            model.models[key],
            [...namespaces, key],
            dispatch
          );
        } else {
          return undefined;
        }
      }
    }
  ) as ModelActionHelpers<TModel>;
}
