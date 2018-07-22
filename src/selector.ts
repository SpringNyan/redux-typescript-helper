import { Model } from "./model";
import { getSubObject } from "./util";

export interface SelectorContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>
> {
  state: TState;
  rootState: any;
  getters: Getters<TSelectors>;
  rootGetters: ModelGetters<any>;
  dependencies: TDependencies;
}

export interface Selector<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TResult
> {
  (context: SelectorContext<TDependencies, TState, TSelectors>): TResult;
}

export interface Selectors<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>
> {
  [name: string]: Selector<TDependencies, TState, TSelectors, any>;
}

export type ExtractSelectorResult<
  T extends Selector<any, any, any, any>
> = T extends Selector<any, any, any, infer TResult> ? TResult : any;

export type Getters<T extends Selectors<any, any, any>> = {
  [K in keyof T]: ExtractSelectorResult<T[K]>
};

export type ModelGetters<TModel extends Model> = Getters<TModel["selectors"]> &
  {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model
      ? ModelGetters<TModel["models"][K]>
      : never
  };

export function createModelGetters<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  getState: () => any,
  rootGetters: ModelGetters<any> | null,
  dependencies: TDependencies
): ModelGetters<TModel> {
  if (rootGetters == null && namespaces.length > 0) {
    throw new Error("rootGetters is required for creating sub model getters");
  }

  const modelGetters: any = new Proxy(
    {},
    {
      get(_target, key: string) {
        if (rootGetters == null) {
          rootGetters = modelGetters;
        }

        if (key in model.selectors) {
          const rootState = getState();
          const state = getSubObject(rootState, namespaces);

          return model.selectors[key]({
            state,
            rootState,
            getters: modelGetters,
            rootGetters: rootGetters!,
            dependencies
          });
        } else if (key in model.models) {
          return createModelGetters(
            model.models[key],
            [...namespaces, key],
            getState,
            rootGetters,
            dependencies
          );
        } else {
          return undefined;
        }
      }
    }
  );

  return modelGetters;
}
