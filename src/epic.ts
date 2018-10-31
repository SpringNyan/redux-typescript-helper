import { Observable, merge } from "rxjs";
import {
  map,
  filter,
  mergeMap,
  catchError,
  takeUntil,
  distinctUntilChanged
} from "rxjs/operators";
import { Action as ReduxAction, Dispatch } from "redux";
import {
  ActionsObservable,
  StateObservable,
  Epic as ReduxObservableEpic
} from "redux-observable";

import { DeepState } from "./state";
import {
  Action,
  DeepActionHelpers,
  actionTypes,
  actionDispatchCallback
} from "./action";
import { Selectors, DeepGetters } from "./selector";
import { Reducers } from "./reducer";
import { Model, Models } from "./model";
import { StoreHelper, StoreHelperDependencies } from "./store";
import { getIn, startsWith, endsWith } from "./util";

export interface EpicContext<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState>,
  TModels extends Models<TDependencies>,
  TDynamicModels extends Models<TDependencies>
> {
  action$: ActionsObservable<Action<unknown>>;
  rootAction$: ActionsObservable<ReduxAction>;
  state$: StateObservable<DeepState<TState, TModels>>;
  rootState$: StateObservable<unknown>;

  helper: StoreHelper<
    Model<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >
  >;
  actions: DeepActionHelpers<TReducers, TEffects, TModels, TDynamicModels>;
  getters: DeepGetters<TState, TSelectors, TModels, TDynamicModels>;
  dependencies: StoreHelperDependencies<TDependencies>;
}

export interface Epic<
  TDependencies = any,
  TState = any,
  TSelectors extends Selectors<TDependencies, TState> = any,
  TReducers extends Reducers<TDependencies, TState> = any,
  TEffects extends Effects<TDependencies, TState> = any,
  TModels extends Models<TDependencies> = any,
  TDynamicModels extends Models<TDependencies> = any
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >
  ): Observable<ReduxAction>;
}

export type Epics<
  TDependencies = any,
  TState = any,
  TSelectors extends Selectors<TDependencies, TState> = any,
  TReducers extends Reducers<TDependencies, TState> = any,
  TEffects extends Effects<TDependencies, TState> = any,
  TModels extends Models<TDependencies> = any,
  TDynamicModels extends Models<TDependencies> = any
> = Array<
  Epic<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  >
>;

export interface Effect<
  TDependencies = any,
  TState = any,
  TSelectors extends Selectors<TDependencies, TState> = any,
  TReducers extends Reducers<TDependencies, TState> = any,
  TEffects extends Effects<TDependencies, TState> = any,
  TModels extends Models<TDependencies> = any,
  TDynamicModels extends Models<TDependencies> = any,
  TPayload = any
> {
  (
    context: EpicContext<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >,
    payload: TPayload
  ): (dispatch: Dispatch<ReduxAction>) => Promise<void>;
}

export interface Effects<
  TDependencies = any,
  TState = any,
  TSelectors extends Selectors<TDependencies, TState> = any,
  TReducers extends Reducers<TDependencies, TState> = any,
  TEffects extends Effects<TDependencies, TState> = any,
  TModels extends Models<TDependencies> = any,
  TDynamicModels extends Models<TDependencies> = any
> {
  [type: string]: Effect<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  >;
}

export type ExtractEffects<T extends Model> = T extends Model<
  any,
  any,
  any,
  any,
  infer TEffects,
  any,
  any
>
  ? TEffects
  : never;

export type ReduxObservableEpicErrorHandler = (
  err: any,
  caught: Observable<ReduxAction>
) => Observable<ReduxAction>;

export function toActionObservable(
  asyncEffect: (dispatch: Dispatch<ReduxAction>) => Promise<void>
): Observable<ReduxAction> {
  return new Observable((subscribe) => {
    const dispatch: Dispatch<ReduxAction> = (action) => {
      subscribe.next(action);
      return action;
    };
    asyncEffect(dispatch).then(
      () => subscribe.complete(),
      (reason) => subscribe.error(reason)
    );
  });
}

export function createModelEpic<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>,
  errorHandler: ReduxObservableEpicErrorHandler | null,
  namespaces: string[]
): ReduxObservableEpic<ReduxAction, ReduxAction> {
  return (rootAction$, rootState$) => {
    const namespacePrefix = namespaces.join("/");
    const unregisterSuffix = "/" + actionTypes.unregister;

    const takeUntil$ = rootAction$.pipe(
      filter(
        (action) =>
          typeof action.type === "string" &&
          endsWith(action.type, unregisterSuffix) &&
          startsWith(
            namespacePrefix,
            action.type.substring(
              0,
              action.type.length - unregisterSuffix.length
            )
          )
      )
    );

    return merge(
      ...invokeModelEpics(
        model,
        dependencies,
        rootAction$,
        rootState$,
        namespaces
      ).map(
        (epic) =>
          errorHandler != null ? epic.pipe(catchError(errorHandler)) : epic
      )
    ).pipe(takeUntil(takeUntil$));
  };
}

function invokeModelEpics<TDependencies, TModel extends Model<TDependencies>>(
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>,
  rootAction$: ActionsObservable<ReduxAction>,
  rootState$: StateObservable<any>,
  namespaces: string[]
): Observable<ReduxAction>[] {
  const outputs: Observable<ReduxAction>[] = [];

  for (const key of Object.keys(model.models)) {
    const subModel = model.models[key];
    const subOutputs = invokeModelEpics(
      subModel,
      dependencies,
      rootAction$,
      rootState$,
      [...namespaces, key]
    );

    outputs.push(...subOutputs);
  }

  const state$ = new StateObservable(
    rootState$.pipe(
      map((state) => getIn(state, namespaces)),
      distinctUntilChanged()
    ) as any,
    getIn(rootState$.value, namespaces)
  );

  const helper = getIn(
    dependencies.$storeHelper as StoreHelper<Model>,
    namespaces,
    (obj, key) => obj.$child(key)
  )!;
  const actions = helper.actions;
  const getters = helper.getters;

  for (const key of Object.keys(model.effects)) {
    const effect = model.effects[key];
    const action$ = rootAction$.ofType<Action>([...namespaces, key].join("/"));

    const output$ = action$.pipe(
      mergeMap((action) => {
        actionDispatchCallback.setDispatched(action);

        const payload = action.payload;
        const asyncEffect = effect(
          {
            action$,
            rootAction$,
            state$,
            rootState$,

            helper,
            actions,
            getters,
            dependencies
          },
          payload
        );
        const wrappedAsyncEffect = (dispatch: Dispatch) => {
          const promise = asyncEffect(dispatch);
          promise.then(
            () => {
              actionDispatchCallback.resolve(action);
            },
            (err) => {
              actionDispatchCallback.reject(action, err);
            }
          );
          return promise;
        };

        return toActionObservable(wrappedAsyncEffect);
      })
    );

    outputs.push(output$);
  }

  const namespacePrefix = namespaces.join("/") + "/";
  for (const epic of model.epics) {
    const action$ = new ActionsObservable(
      rootAction$.pipe(
        filter(
          (action): action is Action =>
            typeof action.type === "string" &&
            startsWith(action.type, namespacePrefix)
        )
      )
    );

    const output$ = epic({
      action$,
      rootAction$,
      state$,
      rootState$,

      helper,
      actions,
      getters,
      dependencies
    });

    outputs.push(output$);
  }

  return outputs;
}
