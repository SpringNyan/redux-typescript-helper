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
  getState: () => any,
  dependencies: TDependencies,
  namespaces: string[],
  rootGetters: ModelGetters<any> | null
): ModelGetters<TModel> {
  if (rootGetters == null && namespaces.length > 0) {
    throw new Error("rootGetters is required for creating sub model getters");
  }

  const getters = {} as any;
  if (rootGetters == null) {
    rootGetters = getters;
  }

  for (const key of Object.keys(model.selectors)) {
    Object.defineProperty(getters, key, {
      get() {
        const rootState = getState();
        const state = getSubObject(rootState, namespaces);

        return model.selectors[key]({
          state,
          rootState,
          getters,
          rootGetters: rootGetters!,
          dependencies
        });
      },
      enumerable: true,
      configurable: true
    });
  }

  for (const key of Object.keys(model.models)) {
    getters[key] = createModelGetters(
      model.models[key],
      getState,
      dependencies,
      [...namespaces, key],
      rootGetters
    );
  }

  return getters;
}
