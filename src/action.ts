import { Dispatch, AnyAction } from "redux";

import { Reducer, Reducers, ExtractReducers } from "./reducer";
import { Effect, Effects, ExtractEffects } from "./epic";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
import { StoreHelperDependencies } from "./store";

class ActionDispatchCallback {
  // TODO: es5 fallback
  private readonly _itemMap = new Map<
    AnyAction,
    {
      hasDispatched: boolean;
      resolve: () => void;
      reject: (err: unknown) => void;
    }
  >();

  public setDispatched(action: AnyAction): void {
    const item = this._itemMap.get(action);
    if (item != null) {
      item.hasDispatched = true;
    }
  }

  public hasDispatched(action: AnyAction): boolean {
    const item = this._itemMap.get(action);
    if (item != null) {
      return item.hasDispatched;
    }

    return false;
  }

  public resolve(action: AnyAction): void {
    const item = this._itemMap.get(action);
    if (item != null) {
      item.resolve();
      this._itemMap.delete(action);
    }
  }

  public reject(action: AnyAction, err: unknown): void {
    const item = this._itemMap.get(action);
    if (item != null) {
      item.reject(err);
      this._itemMap.delete(action);
    }
  }

  public register(action: AnyAction): Promise<void> {
    return new Promise((resolve, reject) => {
      this._itemMap.set(action, {
        hasDispatched: false,
        resolve,
        reject
      });
    });
  }
}

export const actionDispatchCallback = new ActionDispatchCallback();

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
  T extends Action | Reducer | Effect
> = T extends
  | Action<infer TPayload>
  | Reducer<any, any, infer TPayload>
  | Effect<any, any, any, any, any, any, any, infer TPayload>
  ? TPayload
  : never;

export type ExtractActionPayloads<T extends Reducers | Effects> = {
  [K in keyof T]: ExtractActionPayload<T[K]>
};

export interface ActionHelper<TPayload = any> {
  (payload: TPayload): Action<TPayload>;
  type: string;
  is(action: any): action is Action<TPayload>;
  dispatch(payload: TPayload, dispatch?: Dispatch): Promise<void>;
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
  [K in keyof TModels]: ModelActionHelpers<TModels[K]>
};

function isAction(this: ActionHelper, action: any): action is Action {
  return action != null && action.type === this.type;
}

export function createActionHelper<TPayload>(
  type: string,
  defaultDispatch: Dispatch
): ActionHelper<TPayload> {
  const actionHelper = ((payload: TPayload) => ({
    type,
    payload
  })) as ActionHelper<TPayload>;

  actionHelper.type = type;
  actionHelper.is = isAction;
  actionHelper.dispatch = (payload, dispatch) => {
    const action = actionHelper(payload);
    const promise = actionDispatchCallback.register(action);

    (dispatch || defaultDispatch)(action);

    Promise.resolve().then(() => {
      if (!actionDispatchCallback.hasDispatched(action)) {
        actionDispatchCallback.resolve(action);
      }
    });

    return promise;
  };

  return actionHelper;
}

export function createModelActionHelpers<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>,
  namespaces: string[],
  parent: ModelActionHelpers<Model> | null
): ModelActionHelpers<TModel> {
  const actions = {
    $namespace: namespaces.join("/"),
    $parent: parent
  } as ModelActionHelpers<TModel>;

  actions.$root = parent != null ? parent.$root : actions;
  actions.$child = (namespace: string) => actions[namespace];

  const dispatch = <T extends AnyAction>(action: T) =>
    dependencies.$store.dispatch(action);

  for (const key of [
    ...Object.keys(model.reducers),
    ...Object.keys(model.effects)
  ]) {
    actions[key] = createActionHelper(
      [...namespaces, key].join("/"),
      dispatch
    ) as any;
  }

  for (const key of Object.keys(model.models)) {
    actions[key] = createModelActionHelpers(
      model.models[key],
      dependencies,
      [...namespaces, key],
      actions
    ) as any;
  }

  return actions;
}
