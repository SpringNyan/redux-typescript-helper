import { Model } from "./model";
import { getSubObject } from "./util";

export interface Selector<TDependencies, TState, TResult> {
  (state: TState, dependencies: TDependencies): TResult;
}

export interface Selectors<TDependencies, TState> {
  [name: string]: Selector<TDependencies, TState, any>;
}

export type ExtractSelectorResult<
  T extends Selector<any, any, any>
> = T extends Selector<any, any, infer TResult> ? TResult : any;

export type Getters<T extends Selectors<any, any>> = {
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
  dependencies: TDependencies
): ModelGetters<TModel> {
  return new Proxy(
    {},
    {
      get(_target, key: string) {
        if (key in model.selectors) {
          const state = getSubObject(getState(), namespaces);
          return model.selectors[key](state, dependencies);
        } else if (key in model.models) {
          return createModelGetters(
            model.models[key],
            [...namespaces, key],
            getState,
            dependencies
          );
        } else {
          return undefined;
        }
      }
    }
  ) as ModelGetters<TModel>;
}
