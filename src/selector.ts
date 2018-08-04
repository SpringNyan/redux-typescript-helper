import { Model } from "./model";
import { StoreHelperDependencies } from "./store";

export interface SelectorContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>
> {
  state: TState;
  rootState: any;
  getters: Getters<TSelectors>;
  rootGetters: ModelGetters<any>;
  dependencies: StoreHelperDependencies<TDependencies>;
}

export interface Selector<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TResult
> {
  (context: SelectorContext<TDependencies, TState, TSelectors>): TResult;
}

export interface SelectorCreator<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>
> {
  <T1, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    combiner: (res1: T1) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
  <T1, T2, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, T2>,
    combiner: (res1: T1, res2: T2) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
  <T1, T2, T3, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, T3>,
    combiner: (res1: T1, res2: T2, res3: T3) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
  <T1, T2, T3, T4, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, T4>,
    combiner: (res1: T1, res2: T2, res3: T3, res4: T4) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
  <T1, T2, T3, T4, T5, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, T4>,
    selector5: Selector<TDependencies, TState, TSelectors, T5>,
    combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
  <T1, T2, T3, T4, T5, T6, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, T4>,
    selector5: Selector<TDependencies, TState, TSelectors, T5>,
    selector6: Selector<TDependencies, TState, TSelectors, T6>,
    combiner: (
      res1: T1,
      res2: T2,
      res3: T3,
      res4: T4,
      res5: T5,
      res6: T6
    ) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
  <T1, T2, T3, T4, T5, T6, T7, TResult>(
    selector1: Selector<TDependencies, TState, TSelectors, T1>,
    selector2: Selector<TDependencies, TState, TSelectors, T2>,
    selector3: Selector<TDependencies, TState, TSelectors, T3>,
    selector4: Selector<TDependencies, TState, TSelectors, T4>,
    selector5: Selector<TDependencies, TState, TSelectors, T5>,
    selector6: Selector<TDependencies, TState, TSelectors, T6>,
    selector7: Selector<TDependencies, TState, TSelectors, T7>,
    combiner: (
      res1: T1,
      res2: T2,
      res3: T3,
      res4: T4,
      res5: T5,
      res6: T6,
      res7: T7
    ) => TResult
  ): Selector<TDependencies, TState, TSelectors, TResult>;
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
