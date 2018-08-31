import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./epic";
import { Model, Models } from "./model";

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
    | Effect<any, any, any, any, any, any, any>
    | EffectWithOperator<any, any, any, any, any, any, any>
> = T extends
  | Action<infer TPayload>
  | Reducer<any, any, infer TPayload>
  | Effect<any, any, any, any, any, any, infer TPayload>
  | EffectWithOperator<any, any, any, any, any, any, infer TPayload>
  ? TPayload
  : never;

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
  T extends Reducers<any, any> | Effects<any, any, any, any, any, any>
> = { [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>> };

export type ModelActionHelpers<
  TModel extends Model<any, any, any, any, any, any, any>
> = ActionHelpers<TModel["reducers"]> &
  ActionHelpers<TModel["effects"]> &
  ModelsActionHelpers<TModel["models"]> & {
    $namespace: string;
    $epicEnd: ActionHelper<{}>;
    $parent: unknown;
    $root: unknown;
  };

export type ModelsActionHelpers<TModels extends Models<any>> = {
  [K in keyof TModels]: TModels[K] extends Model<
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? ModelActionHelpers<TModels[K]>
    : never
};
