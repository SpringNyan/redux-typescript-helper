import { Observable, OperatorFunction } from "rxjs";
import { Action as ReduxAction, Dispatch } from "redux";
import { ActionsObservable, StateObservable } from "redux-observable";

import { Action, ActionHelpers } from "./action";
import { Selectors, Getters } from "./selector";
import { Reducers } from "./reducer";
import { StoreHelperDependencies } from "./store";

export interface EpicContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any>,
  TPayload
> {
  action$: ActionsObservable<Action<TPayload>>;
  rootAction$: ActionsObservable<ReduxAction>;
  state$: StateObservable<TState>;
  rootState$: StateObservable<unknown>;
  actions: ActionHelpers<TReducers & TEffects>;
  rootActions: {};
  getters: Getters<TSelectors>;
  rootGetters: {};
  dependencies: StoreHelperDependencies<TDependencies>;
}

export interface Epic<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any>
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      unknown
    >
  ): Observable<ReduxAction>;
}

export interface Effect<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any>,
  TPayload
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      unknown
    >,
    payload: TPayload
  ): Observable<ReduxAction>;
}

export type EffectWithOperator<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any>,
  TPayload
> = [
  Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TPayload>,
  (...args: any[]) => OperatorFunction<Action<TPayload>, Action<TPayload>>
];

export interface Effects<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any>
> {
  [type: string]:
    | Effect<TDependencies, TState, TSelectors, TReducers, TEffects, any>
    | EffectWithOperator<
        TDependencies,
        TState,
        TSelectors,
        TReducers,
        TEffects,
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
