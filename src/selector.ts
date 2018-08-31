import { ModelState } from "./state";
import { Model, Models } from "./model";
import { StoreHelperDependencies } from "./store";

export interface SelectorContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies>
> {
  state: ModelState<
    Model<TDependencies, TState, TSelectors, any, any, TModels>
  >;
  rootState: unknown;
  getters: ModelGetters<
    Model<TDependencies, TState, TSelectors, any, any, TModels>
  >;
  rootGetters: unknown;
  dependencies: StoreHelperDependencies<TDependencies>;
}

export interface Selector<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies>,
  TResult
> {
  (
    context: SelectorContext<TDependencies, TState, TSelectors, TModels>
  ): TResult;
}

export interface SelectorCreator<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies>
> {
  <T1, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    combiner: (res1: T1) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
  <T1, T2, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, TModels, T2>,
    combiner: (res1: T1, res2: T2) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
  <T1, T2, T3, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, TModels, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, TModels, T3>,
    combiner: (res1: T1, res2: T2, res3: T3) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
  <T1, T2, T3, T4, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, TModels, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, TModels, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, TModels, T4>,
    combiner: (res1: T1, res2: T2, res3: T3, res4: T4) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
  <T1, T2, T3, T4, T5, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, TModels, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, TModels, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, TModels, T4>,
    selector5: Selector<TDependencies, TState, TSelectors, TModels, T5>,
    combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
  <T1, T2, T3, T4, T5, T6, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, TModels, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, TModels, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, TModels, T4>,
    selector5: Selector<TDependencies, TState, TSelectors, TModels, T5>,
    selector6: Selector<TDependencies, TState, TSelectors, TModels, T6>,
    combiner: (
      res1: T1,
      res2: T2,
      res3: T3,
      res4: T4,
      res5: T5,
      res6: T6
    ) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
  <T1, T2, T3, T4, T5, T6, T7, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, TModels, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, TModels, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, TModels, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, TModels, T4>,
    selector5: Selector<TDependencies, TState, TSelectors, TModels, T5>,
    selector6: Selector<TDependencies, TState, TSelectors, TModels, T6>,
    selector7: Selector<TDependencies, TState, TSelectors, TModels, T7>,
    combiner: (
      res1: T1,
      res2: T2,
      res3: T3,
      res4: T4,
      res5: T5,
      res6: T6,
      res7: T7
    ) => TResult
  ): Selector<TDependencies, TState, TSelectors, TModels, TResult>;
}

export interface Selectors<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies>
> {
  [name: string]: Selector<TDependencies, TState, TSelectors, TModels, any>;
}

export type ExtractSelectorResult<
  T extends Selector<any, any, any, any, any>
> = T extends Selector<any, any, any, any, infer TResult> ? TResult : never;

export type Getters<T extends Selectors<any, any, any, any>> = {
  [K in keyof T]: ExtractSelectorResult<T[K]>
};

export type ModelGetters<
  TModel extends Model<any, any, any, any, any, any>
> = Getters<TModel["selectors"]> &
  ModelsGetters<TModel["models"]> & {
    $namespace: string;
    $state: ModelState<TModel>;
    $rootState: unknown;
    $parent: unknown;
    $root: unknown;
  };

export type ModelsGetters<TModels extends Models<any>> = {
  [K in keyof TModels]: TModels[K] extends Model<any, any, any, any, any, any>
    ? ModelGetters<TModels[K]>
    : never
};
