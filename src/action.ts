import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./epic";
import { Model } from "./model";

export const actionTypes = {
  register: "@@REGISTER",
  epicEnd: "@@EPIC_END",
  unregister: "@@UNREGISTER"
};

export interface Action<TPayload> {
  type: string;
  payload: TPayload;
}

export type ExtractActionPayload<
  T extends
    | Action<any>
    | Reducer<any, any, any>
    | Effect<any, any, any, any, any, any>
    | EffectWithOperator<any, any, any, any, any, any>
> = T extends
  | Action<infer TPayload>
  | Reducer<any, any, infer TPayload>
  | Effect<any, any, any, any, any, infer TPayload>
  | EffectWithOperator<any, any, any, any, any, infer TPayload>
  ? TPayload
  : any;

export interface ActionHelper<TPayload> {
  (payload: TPayload): Action<TPayload>;
  type: string;
  is(action: any): action is Action<TPayload>;
}

function isAction(this: ActionHelper<any>, action: any): action is Action<any> {
  return action != null && action.type === this.type;
}

export function createActionHelper<TPayload>(
  type: string
): ActionHelper<TPayload> {
  const actionHelper = ((payload: TPayload) => ({
    type,
    payload
  })) as ActionHelper<TPayload>;

  actionHelper.type = type;
  actionHelper.is = isAction;

  return actionHelper;
}

export type ActionHelpers<
  T extends Reducers<any, any> | Effects<any, any, any, any, any>
> = { [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>> };

export type ModelActionHelpers<TModel extends Model> = ActionHelpers<
  TModel["reducers"] & TModel["effects"]
> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelActionHelpers<TModel["models"][K]>
      : never
  };
