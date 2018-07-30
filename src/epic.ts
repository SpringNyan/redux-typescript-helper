import { Observable, OperatorFunction, merge } from "rxjs";
import { map, takeUntil, mergeMap, filter, catchError } from "rxjs/operators";
import { Dispatch } from "redux";
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
import { Selectors, Getters, ModelGetters } from "./selector";
import { Reducers } from "./reducer";
import { Model } from "./model";
import { getSubObject } from "./util";

export interface EpicContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects
  >,
  TPayload
> {
  action$: ActionsObservable<Action<TPayload>>;
  rootAction$: ActionsObservable<Action<any>>;
  state$: StateObservable<TState>;
  rootState$: StateObservable<any>;
  actions: ActionHelpers<TReducers & TEffects>;
  rootActions: ModelActionHelpers<any>;
  getters: Getters<TSelectors>;
  rootGetters: ModelGetters<any>;
  dependencies: TDependencies;
}

export interface Epic<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects
  >
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      any
    >
  ): Observable<Action<any>>;
}

export interface Effect<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects
  >,
  TPayload
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      any
    >,
    payload: TPayload
  ): Observable<Action<any>>;
}

export type EffectWithOperator<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects
  >,
  TPayload
> = [
  Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TPayload>,
  (...args: any[]) => OperatorFunction<Action<TPayload>, Action<TPayload>>
];

export interface Effects<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, TSelectors>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects
  >
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

export function registerModelEpics<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  rootActions: ModelActionHelpers<TModel>,
  rootGetters: ModelGetters<TModel>,
  rootAction$: ActionsObservable<Action<any>>,
  rootState$: StateObservable<any>,
  dependencies: TDependencies
): Observable<Action<any>>[] {
  const outputs: Observable<Action<any>>[] = [];

  for (const key of Object.keys(model.models)) {
    const subModel = model.models[key];
    const subOutputs = registerModelEpics(
      subModel,
      [...namespaces, key],
      rootActions,
      rootGetters,
      rootAction$,
      rootState$,
      dependencies
    );

    outputs.push(...subOutputs);
  }

  const unregisterType = `${namespaces.join("/")}/${actionTypes.unregister}`;
  const takeUntil$ = rootAction$.pipe(
    filter((action) => action.type === unregisterType)
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
  const getters = getSubObject(rootGetters, namespaces)!;

  for (const key of Object.keys(model.effects)) {
    let effect: Effect<any, any, any, any, any, any>;
    let operator = mergeMap;

    const effectWithOperator = model.effects[key];
    if (Array.isArray(effectWithOperator)) {
      [effect, operator] = effectWithOperator;
    } else {
      effect = effectWithOperator;
    }

    const action$ = rootAction$.ofType([...namespaces, key].join("/"));

    const output$ = action$.pipe<Action<any>>(
      operator((action) => {
        const payload = action.payload;
        return effect(
          {
            action$,
            rootAction$,
            state$,
            rootState$,
            actions,
            rootActions,
            getters,
            rootGetters,
            dependencies
          },
          payload
        );
      })
    );

    outputs.push(output$);
  }

  const namespacePrefix = namespaces.join("/");
  for (const epic of model.epics) {
    const action$ = new ActionsObservable(
      rootAction$.pipe(
        filter((action) => action.type.lastIndexOf(namespacePrefix, 0) === 0)
      )
    );

    const output$ = epic({
      action$,
      rootAction$,
      state$,
      rootState$,
      actions,
      rootActions,
      getters,
      rootGetters,
      dependencies
    });

    outputs.push(output$);
  }

  return outputs;
}

export interface CreateModelRootEpicOptions {
  errorHandler?: (
    err: any,
    caught: Observable<Action<any>>
  ) => Observable<Action<any>>;
}

export function createModelRootEpic<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  actions: ModelActionHelpers<TModel>,
  getters: ModelGetters<TModel>,
  dependencies: TDependencies,
  options: CreateModelRootEpicOptions
): ReduxObservableEpic<any, Action<any>> {
  return (action$, state$) =>
    merge(
      ...registerModelEpics(
        model,
        namespaces,
        actions,
        getters,
        action$,
        state$,
        dependencies
      ).map(
        (epic) =>
          options.errorHandler != null
            ? epic.pipe(
                catchError((err, caught) => options.errorHandler!(err, caught))
              )
            : epic
      )
    );
}

export function asyncEffect(
  asyncFn: (dispatch: Dispatch<Action<any>>) => Promise<void>
): Observable<Action<any>> {
  return new Observable((subscribe) => {
    const dispatch: Dispatch<Action<any>> = (action) => {
      subscribe.next(action);
      return action;
    };
    asyncFn(dispatch).then(
      () => subscribe.complete(),
      (reason) => subscribe.error(reason)
    );
  });
}