import { Observable, OperatorFunction } from "rxjs";
import { Action as ReduxAction, Dispatch } from "redux";
import { ActionsObservable, StateObservable } from "redux-observable";

import { ModelsState } from "./state";
import { Action, ActionHelpers, ModelsActionHelpers } from "./action";
import { Selectors, Getters, ModelsGetters } from "./selector";
import { Reducers } from "./reducer";
import { Models } from "./model";
import { StoreHelperDependencies } from "./store";

export interface EpicContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>
> {
  action$: ActionsObservable<Action<unknown>>;
  rootAction$: ActionsObservable<ReduxAction>;
  state$: StateObservable<TState & ModelsState<TModels>>;
  rootState$: StateObservable<unknown>;
  actions: ActionHelpers<TReducers & TEffects> & ModelsActionHelpers<TModels>;
  rootActions: unknown;
  getters: Getters<TSelectors> & ModelsGetters<TModels>;
  rootGetters: unknown;
  dependencies: StoreHelperDependencies<TDependencies>;
}

export interface Epic<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels
    >
  ): Observable<ReduxAction>;
}

export interface Effect<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>,
  TPayload
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels
    >,
    payload: TPayload
  ): Observable<ReduxAction>;
}

export type EffectWithOperator<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>,
  TPayload
> = [
  Effect<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TPayload
  >,
  (...args: any[]) => OperatorFunction<Action<TPayload>, Action<TPayload>>
];

export interface Effects<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>
> {
  [type: string]:
    | Effect<
        TDependencies,
        TState,
        TSelectors,
        TReducers,
        TEffects,
        TModels,
        any
      >
    | EffectWithOperator<
        TDependencies,
        TState,
        TSelectors,
        TReducers,
        TEffects,
        TModels,
        any
      >;
}

export function asyncEffect(
  asyncFn: (dispatch: Dispatch<ReduxAction>) => Promise<void>
): Observable<ReduxAction> {
  return new Observable((subscribe) => {
    const dispatch: Dispatch<ReduxAction> = (action) => {
      subscribe.next(action);
      return action;
    };
    asyncFn(dispatch).then(
      () => subscribe.complete(),
      (reason) => subscribe.error(reason)
    );
  });
}
