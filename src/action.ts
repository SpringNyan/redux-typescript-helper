import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./effect";
import { Model } from "./model";

export const actionTypes = {
  registerModel: "@@REGISTER_MODEL",
  unregisterModel: "@@UNREGISTER_MODEL"
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
  : never;

export interface ActionHelper<TPayload> {
  (payload: TPayload): Action<TPayload>;
  type: string;
  is(action: Action<any>): action is Action<TPayload>;
}

export type ActionHelpers<
  T extends Reducers<any, any> | Effects<any, any, any, any>
> = { [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>> };

export type ModelActionHelpers<
  TModel extends Model<any, any, any, any, any>
> = ActionHelpers<TModel["reducers"] & TModel["effects"]> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelActionHelpers<TModel["models"][K]>
      : never
  };

function createActionHelper<TPayload>(type: string): ActionHelper<TPayload> {
  const helper = ((payload: TPayload): Action<TPayload> => ({
    type,
    payload
  })) as ActionHelper<TPayload>;

  helper.type = type;
  helper.is = (action: Action<any>): action is Action<TPayload> =>
    action.type === type;

  return helper;
}

export function createModelActionHelpers<TModel extends Model>(
  model: TModel,
  namespaces: string[]
): ModelActionHelpers<TModel> {
  return new Proxy(
    {},
    {
      get(_target, key: string) {
        if (key in model.reducers || key in model.effects) {
          return createActionHelper([...namespaces, key].join("/"));
        } else if (key in model.models) {
          return createModelActionHelpers(model.models[key], [
            ...namespaces,
            key
          ]);
        } else {
          return undefined;
        }
      }
    }
  ) as ModelActionHelpers<TModel>;
}
