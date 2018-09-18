import { Reducer, Reducers, ExtractReducers } from "./reducer";
import { Effect, EffectWithOperator, Effects, ExtractEffects } from "./epic";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";

export const actionTypes = {
  register: "@@REGISTER",
  epicEnd: "@@EPIC_END",
  unregister: "@@UNREGISTER"
};

export interface Action<TPayload = any> {
  type: string;
  payload: TPayload;
}

export type ExtractActionPayload<
  T extends Action | Reducer | Effect | EffectWithOperator
> = T extends
  | Action<infer TPayload>
  | Reducer<any, any, infer TPayload>
  | Effect<any, any, any, any, any, any, any, infer TPayload>
  | EffectWithOperator<any, any, any, any, any, any, any, infer TPayload>
  ? TPayload
  : never;

export type ExtractActionPayloads<T extends Reducers | Effects> = {
  [K in keyof T]: ExtractActionPayload<T[K]>
};

export interface ActionHelper<TPayload = any> {
  (payload: TPayload): Action<TPayload>;
  type: string;
  is(action: any): action is Action<TPayload>;
}

export type ActionHelpers<T> = { [K in keyof T]: ActionHelper<T[K]> };

export type DeepActionHelpers<
  TReducers extends Reducers,
  TEffects extends Effects,
  TModels extends Models,
  TDynamicModels extends Models
> = ActionHelpers<
  ExtractActionPayloads<TReducers> & ExtractActionPayloads<TEffects>
> &
  ModelsActionHelpers<TModels> & {
    $namespace: string;
    $parent: DeepActionHelpers<{}, {}, {}, {}> | null;
    $root: DeepActionHelpers<{}, {}, {}, {}>;
    $child: DeepActionHelpersChild<TModels, TDynamicModels>;
  };

export interface DeepActionHelpersChild<
  TModels extends Models,
  TDynamicModels extends Models
> {
  <K extends keyof TModels>(namespace: K): ModelActionHelpers<TModels[K]>;
  <K extends keyof TDynamicModels>(namespace: K): ModelActionHelpers<
    TDynamicModels[K]
  > | null;
}

export type ModelActionHelpers<TModel extends Model> = DeepActionHelpers<
  ExtractReducers<TModel>,
  ExtractEffects<TModel>,
  ExtractModels<TModel>,
  ExtractDynamicModels<TModel>
>;

export type ModelsActionHelpers<TModels extends Models> = {
  [K in keyof TModels]: TModels[K] extends Model
    ? ModelActionHelpers<TModels[K]>
    : never
};

function isAction(this: ActionHelper, action: any): action is Action {
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

export function createModelActionHelpers<TModel extends Model>(
  model: TModel,
  namespaces: string[],
  parent: ModelActionHelpers<Model> | null
): ModelActionHelpers<TModel> {
  const actions = {
    $namespace: namespaces.join("/"),
    $parent: parent
  } as ModelActionHelpers<TModel>;

  actions.$root = parent != null ? parent.$root : actions;
  actions.$child = (namespace: string) => actions[namespace];

  for (const key of [
    ...Object.keys(model.reducers),
    ...Object.keys(model.effects)
  ]) {
    actions[key] = createActionHelper([...namespaces, key].join("/")) as any;
  }

  for (const key of Object.keys(model.models)) {
    actions[key] = createModelActionHelpers(
      model.models[key],
      [...namespaces, key],
      actions
    ) as any;
  }

  return actions;
}
