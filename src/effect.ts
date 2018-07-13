import { Observable, merge } from "rxjs";
import { map, takeUntil, skip, skipWhile, mergeMap } from "rxjs/operators";
import {
  Epic as ReduxObservableEpic,
  ActionsObservable,
  StateObservable
} from "redux-observable";

import {
  actionTypes,
  Action,
  ActionHelpers,
  ModelActionHelpers
} from "./action";
import { Reducers } from "./reducer";
import { Model } from "./model";
import { getSubObject } from "./util";

export interface EffectContext<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, TReducers, TEffects>,
  TPayload
> {
  action$: ActionsObservable<Action<TPayload>>;
  rootAction$: ActionsObservable<Action<any>>;
  state$: StateObservable<TState>;
  rootState$: StateObservable<any>;
  actions: ActionHelpers<TReducers & TEffects>;
  rootActions: ModelActionHelpers<any>;
  dependencies: TDependencies;
}

export interface Effect<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, TReducers, TEffects>,
  TPayload
> {
  (
    context: EffectContext<
      TDependencies,
      TState,
      TReducers,
      TEffects,
      any /* TPayload */
    >,
    payload: TPayload
  ): Observable<Action<any>>;
}

export type EffectWithOperator<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, TReducers, TEffects>,
  TPayload
> = [Effect<TDependencies, TState, TReducers, TEffects, TPayload>, Function];

export interface Effects<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, TReducers, TEffects>
> {
  [type: string]:
    | Effect<TDependencies, TState, TReducers, TEffects, any>
    | EffectWithOperator<TDependencies, TState, TReducers, TEffects, any>;
}

export function registerModelEffects<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  rootActions: ModelActionHelpers<TModel>,
  rootAction$: ActionsObservable<Action<any>>,
  rootState$: StateObservable<any>,
  dependencies: TDependencies
): Observable<Action<any>>[] {
  const outputs: Observable<Action<any>>[] = [];

  for (const key of Object.keys(model.models)) {
    const subModel = model.models[key];
    const subOutputs = registerModelEffects(
      subModel,
      [...namespaces, key],
      rootActions,
      rootAction$,
      rootState$,
      dependencies
    );

    outputs.push(...subOutputs);
  }

  const takeUntil$ = rootAction$.pipe(
    skipWhile(
      (action) =>
        action.type !== `${namespaces.join("/")}/${actionTypes.unregister}`
    ),
    skip(1)
  );

  rootAction$ = new ActionsObservable(rootAction$.pipe(takeUntil(takeUntil$)));

  rootState$ = new StateObservable(
    rootState$.pipe(takeUntil(takeUntil$)) as any,
    rootState$.value
  );

  const state$ = new StateObservable(
    rootState$.pipe(map((state) => getSubObject(state, namespaces))) as any,
    getSubObject(rootState$.value, namespaces)
  );

  const actions = getSubObject(rootActions, namespaces)!;

  for (const key of Object.keys(model.effects)) {
    let effect: Effect<any, any, any, any, any>;
    let operator: Function = mergeMap;

    const effectWithOperator = model.effects[key];
    if (Array.isArray(effectWithOperator)) {
      [effect, operator] = effectWithOperator;
    } else {
      effect = effectWithOperator;
    }

    const action$ = rootAction$.ofType([...namespaces, key].join("/"));

    const output$ = action$.pipe<Action<any>>(
      operator((action: Action<any>) => {
        const payload = action.payload;
        return effect(
          {
            action$,
            rootAction$,
            state$,
            rootState$,
            actions,
            rootActions,
            dependencies
          },
          payload
        );
      })
    );

    outputs.push(output$);
  }

  return outputs;
}

export function createModelEpic<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  actions: ModelActionHelpers<TModel>,
  dependencies: TDependencies
): ReduxObservableEpic<any, Action<any>> {
  return (action$, state$) =>
    merge(
      ...registerModelEffects(
        model,
        namespaces,
        actions,
        action$,
        state$,
        dependencies
      )
    );
}
