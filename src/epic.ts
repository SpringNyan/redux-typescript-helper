import { Observable, merge } from "rxjs";
import {
  map,
  filter,
  mergeMap,
  catchError,
  takeUntil,
  distinctUntilChanged
} from "rxjs/operators";
import { Action as ReduxAction, Dispatch, AnyAction } from "redux";
import {
  ActionsObservable,
  StateObservable,
  Epic as ReduxObservableEpic
} from "redux-observable";

import { DeepState } from "./state";
import {
  Action,
  DeepActionHelpers,
  ExtractActionPayload,
  actionTypes
} from "./action";
import { Selectors, DeepGetters } from "./selector";
import { Reducers } from "./reducer";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
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
  dispatch: DeepActionDispatchers<TEffects, TModels, TDynamicModels>;
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
  TPayload = any,
  TResult = any
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
  ): (dispatch: Dispatch<ReduxAction>) => Promise<TResult>;
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

export type ExtractEffectResult<T extends Effect> = T extends Effect<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer TResult
>
  ? TResult
  : never;

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

interface ActionInternal extends Action {
  __dispatch_id?: number;
}

interface ActionDispatcherInternal<TPayload = any, TResult = any>
  extends ActionDispatcher<TPayload, TResult> {
  _nextId: number;
  _callbackById: {
    [id: number]: {
      resolve: (result: TResult) => void;
      reject: (err: unknown) => void;
    };
  };
}

export interface ActionDispatcher<TPayload = any, TResult = any> {
  (payload: TPayload): Promise<TResult>;
}

export type ActionDispatchers<TEffects extends Effects> = {
  [K in keyof TEffects]: ActionDispatcher<
    ExtractActionPayload<TEffects[K]>,
    ExtractEffectResult<TEffects[K]>
  >
};

export type DeepActionDispatchers<
  TEffects extends Effects,
  TModels extends Models,
  TDynamicModels extends Models
> = ActionDispatchers<TEffects> &
  ModelsActionDispatchers<TModels> & {
    $namespace: string;
    $parent: DeepActionDispatchers<{}, {}, {}> | null;
    $root: DeepActionDispatchers<{}, {}, {}>;
    $child: DeepActionDispatchersChild<TModels, TDynamicModels>;
  };

export interface DeepActionDispatchersChild<
  TModels extends Models,
  TDynamicModels extends Models
> {
  <K extends keyof TModels>(namespace: K): ModelActionDispatchers<TModels[K]>;
  <K extends keyof TDynamicModels>(namespace: K): ModelActionDispatchers<
    TDynamicModels[K]
  > | null;
}

export type ModelActionDispatchers<
  TModel extends Model
> = DeepActionDispatchers<
  ExtractEffects<TModel>,
  ExtractModels<TModel>,
  ExtractDynamicModels<TModel>
>;

export type ModelsActionDispatchers<TModels extends Models> = {
  [K in keyof TModels]: TModels[K] extends Model
    ? ModelActionDispatchers<TModels[K]>
    : never
};

export type ReduxObservableEpicErrorHandler = (
  err: any,
  caught: Observable<ReduxAction>
) => Observable<ReduxAction>;

export function toActionObservable(
  asyncEffect: (dispatch: Dispatch<ReduxAction>) => Promise<any>
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

function createActionDispatcher<TPayload, TResult>(
  type: string,
  dispatch: Dispatch<ActionInternal>
): ActionDispatcherInternal<TPayload, TResult> {
  const dispatcher = ((payload: TPayload) => {
    const id = dispatcher._nextId;
    dispatcher._nextId += 1;

    // TODO: resolve promise when model is unregistered
    const promise = new Promise((resolve, reject) => {
      dispatcher._callbackById[id] = {
        resolve,
        reject
      };
    });

    const cleanup = () => delete dispatcher._callbackById[id];
    promise.then(cleanup, cleanup);

    dispatch({
      type,
      payload,
      __dispatch_id: id
    });

    return promise;
  }) as ActionDispatcherInternal<TPayload, TResult>;

  dispatcher._nextId = 1;
  dispatcher._callbackById = {};

  return dispatcher;
}

export function createModelActionDispatchers<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>,
  namespaces: string[],
  parent: ModelActionDispatchers<Model> | null
): ModelActionDispatchers<TModel> {
  const dispatchers = {
    $namespace: namespaces.join("/"),
    $parent: parent
  } as ModelActionDispatchers<TModel>;

  dispatchers.$root = parent != null ? parent.$root : dispatchers;
  dispatchers.$child = (namespace: string) => dispatchers[namespace];

  const dispatch = <T extends AnyAction>(action: T) =>
    dependencies.$store.dispatch(action);

  for (const key of Object.keys(model.effects)) {
    dispatchers[key] = createActionDispatcher(
      [...namespaces, key].join("/"),
      dispatch
    ) as any;
  }

  for (const key of Object.keys(model.models)) {
    dispatchers[key] = createModelActionDispatchers(
      model.models[key],
      dependencies,
      [...namespaces, key],
      dispatchers
    ) as any;
  }

  return dispatchers;
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
  const dispatchers = helper.dispatch;

  for (const key of Object.keys(model.effects)) {
    const effect = model.effects[key];
    const action$ = rootAction$.ofType<Action>([...namespaces, key].join("/"));

    const output$ = action$.pipe(
      mergeMap((action: ActionInternal) => {
        const payload = action.payload;
        let asyncEffect = effect(
          {
            action$,
            rootAction$,
            state$,
            rootState$,

            helper,
            actions,
            getters,
            dispatch: dispatchers,
            dependencies
          },
          payload
        );

        if (action.__dispatch_id != null) {
          const _asyncEffect = asyncEffect;

          const dispatchId = action.__dispatch_id;
          const dispatcher = (dispatchers[
            key
          ] as any) as ActionDispatcherInternal;
          const { resolve, reject } = dispatcher._callbackById[dispatchId];

          asyncEffect = (dispatch) => {
            const promise = _asyncEffect(dispatch);
            promise.then(resolve, reject);
            return promise;
          };
        }

        return toActionObservable(asyncEffect);
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
      dispatch: dispatchers,
      dependencies
    });

    outputs.push(output$);
  }

  return outputs;
}
