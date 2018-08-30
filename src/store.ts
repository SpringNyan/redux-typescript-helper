import produce from "immer";
import { BehaviorSubject, Observable, merge } from "rxjs";
import { map, mergeMap, filter, takeUntil, catchError } from "rxjs/operators";
import { Action as ReduxAction, Reducer as ReduxReducer, Store } from "redux";
import {
  Epic as ReduxObservableEpic,
  ActionsObservable,
  StateObservable
} from "redux-observable";

import { ModelState } from "./state";
import {
  actionTypes,
  ModelActionHelpers,
  Action,
  createActionHelper
} from "./action";
import { ModelGetters } from "./selector";
import { Effect } from "./epic";
import { Model } from "./model";

export type StoreHelperDependencies<TDependencies> = TDependencies & {
  storeHelper: StoreHelper<TDependencies, Model<TDependencies>>;
};

export interface StoreHelperOptions {
  epicErrorHandler?: (
    err: any,
    caught: Observable<ReduxAction>
  ) => Observable<ReduxAction>;
}

export interface StoreHelper<
  TDependencies,
  TModel extends Model<TDependencies>
> {
  store: Store;
  state: ModelState<TModel>;
  actions: ModelActionHelpers<TModel>;
  getters: ModelGetters<TModel>;

  namespace<K extends Extract<keyof TModel["models"], string>>(
    namespace: K
  ): StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
  namespace<T extends Model<TDependencies>>(
    namespace: string
  ): StoreHelperWithNamespaces<TDependencies, T>;

  registerModel<T extends Model<TDependencies>>(
    namespace: string,
    model: T
  ): void;
  unregisterModel(namespace: string): void;
}

export type StoreHelperWithNamespaces<
  TDependencies,
  TModel extends Model<TDependencies>
> = StoreHelper<TDependencies, TModel> &
  {
    [K in keyof TModel["models"]]: StoreHelperWithNamespaces<
      TDependencies,
      TModel["models"][K]
    >
  };

export class StoreHelperFactory<
  TDependencies,
  TModel extends Model<TDependencies>
> {
  private readonly _model: TModel;
  private readonly _dependencies: StoreHelperDependencies<TDependencies>;
  private readonly _reducer: ReduxReducer;
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _epic: ReduxObservableEpic;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;
  private readonly _options: StoreHelperOptions;

  private _store?: Store;

  constructor(
    model: TModel,
    dependencies: TDependencies,
    options: StoreHelperOptions
  ) {
    this._model = model;
    this._options = options;

    this._dependencies = {} as StoreHelperDependencies<TDependencies>;
    for (const key of Object.keys(dependencies)) {
      Object.defineProperty(this._dependencies, key, {
        get: () => {
          return dependencies[key as keyof TDependencies];
        },
        enumerable: true,
        configurable: true
      });
    }

    this._reducer = createModelReducer(model, dependencies);

    this._actions = createModelActionHelpers(model, []);
    this._getters = createModelGetters(
      model,
      () => this._store!.getState(),
      this._dependencies,
      [],
      null
    );

    const initialEpic = createModelRootEpic(
      model,
      [],
      this._actions,
      this._getters,
      this._dependencies,
      { errorHandler: this._options.epicErrorHandler }
    );
    this._addEpic$ = new BehaviorSubject(initialEpic);
    this._epic = (action$, state$, epicDependencies) =>
      this._addEpic$.pipe(
        mergeMap((epic) => epic(action$, state$, epicDependencies))
      );
  }

  public get reducer(): ReduxReducer {
    return this._reducer;
  }

  public get epic(): ReduxObservableEpic {
    return this._epic;
  }

  public create(
    store: Store
  ): StoreHelperWithNamespaces<TDependencies, TModel> {
    if (this._store != null) {
      throw new Error("Store helper is already created");
    }

    this._store = store;

    const storeHelper = new _StoreHelper(
      store,
      this._model,
      [],
      this._actions,
      this._actions,
      this._getters,
      this._getters,
      this._addEpic$,
      this._dependencies,
      this._options
    );

    this._dependencies.storeHelper = storeHelper;

    return storeHelper as any;
  }
}

export function createStoreHelperFactory<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  dependencies: TDependencies,
  options?: StoreHelperOptions
): StoreHelperFactory<TDependencies, TModel> {
  if (options == null) {
    options = {};
  }

  return new StoreHelperFactory(model, dependencies, options);
}

class _StoreHelper<TDependencies, TModel extends Model<TDependencies>>
  implements StoreHelper<TDependencies, TModel> {
  private readonly _store: Store;
  private readonly _model: TModel;
  private readonly _dependencies: StoreHelperDependencies<TDependencies>;
  private readonly _namespaces: string[];
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _rootActions: ModelActionHelpers<Model<TDependencies>>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _rootGetters: ModelGetters<Model<TDependencies>>;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;
  private readonly _options: StoreHelperOptions;

  private readonly _subStoreHelpers: {
    [namespace: string]: StoreHelper<TDependencies, Model<TDependencies>>;
  } = {};

  constructor(
    store: Store,
    model: TModel,
    namespaces: string[],
    actions: ModelActionHelpers<TModel>,
    rootActions: ModelActionHelpers<Model<TDependencies>>,
    getters: ModelGetters<TModel>,
    rootGetters: ModelGetters<Model<TDependencies>>,
    addEpic$: BehaviorSubject<ReduxObservableEpic>,
    dependencies: StoreHelperDependencies<TDependencies>,
    options: StoreHelperOptions
  ) {
    this._store = store;
    this._model = model;
    this._namespaces = namespaces;
    this._actions = actions;
    this._rootActions = rootActions;
    this._getters = getters;
    this._rootGetters = rootGetters;
    this._addEpic$ = addEpic$;
    this._dependencies = dependencies;
    this._options = options;

    for (const namespace of Object.keys(model.models)) {
      this._registerSubStoreHelper(namespace);
    }
  }

  public get store(): Store {
    return this._store;
  }

  public get state(): ModelState<TModel> {
    return getSubProperty(this._store.getState(), this._namespaces);
  }

  public get actions(): ModelActionHelpers<TModel> {
    return this._actions;
  }

  public get getters(): ModelGetters<TModel> {
    return this._getters;
  }

  public namespace<K extends Extract<keyof TModel["models"], string>>(
    namespace: K
  ): StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
  public namespace<T extends Model<TDependencies>>(
    namespace: string
  ): StoreHelperWithNamespaces<TDependencies, T>;
  public namespace(
    namespace: string
  ): StoreHelper<TDependencies, Model<TDependencies>> {
    return this._subStoreHelpers[namespace];
  }

  public registerModel<T extends Model>(namespace: string, model: T): void {
    if (this._model.models[namespace] != null) {
      throw new Error("Failed to register model: model is already registered");
    }

    const namespaces = [...this._namespaces, namespace];

    this._model.models[namespace] = cloneModel(model);
    this._actions[namespace] = createModelActionHelpers(
      model,
      namespaces
    ) as any;
    this._getters[namespace] = createModelGetters(
      model,
      () => this._store.getState(),
      this._dependencies,
      namespaces,
      this._rootGetters
    ) as any;

    this._addEpic$.next(
      createModelRootEpic(
        model,
        namespaces,
        this._rootActions,
        this._rootGetters,
        this._dependencies,
        { errorHandler: this._options.epicErrorHandler }
      )
    );

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.register}`
    });

    this._registerSubStoreHelper(namespace);
  }

  public unregisterModel(namespace: string): void {
    if (this._model.models[namespace] == null) {
      throw new Error("Failed to unregister model: model is not existing");
    }

    this._unregisterSubStoreHelper(namespace);

    const namespaces = [...this._namespaces, namespace];

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.epicEnd}`
    });
    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.unregister}`
    });

    delete this._model.models[namespace];
    delete this._actions[namespace];
    delete this._getters[namespace];
  }

  private _registerSubStoreHelper(namespace: string): void {
    this._subStoreHelpers[namespace] = new _StoreHelper(
      this._store,
      this._model.models[namespace],
      [...this._namespaces, namespace],
      this._actions[namespace],
      this._rootActions,
      this._getters[namespace],
      this._rootGetters,
      this._addEpic$,
      this._dependencies,
      this._options
    );

    Object.defineProperty(this, namespace, {
      get: () => {
        return this.namespace(namespace);
      },
      enumerable: true,
      configurable: true
    });
  }

  private _unregisterSubStoreHelper(namespace: string): void {
    delete (this as any)[namespace];
    delete this._subStoreHelpers[namespace];
  }
}

function createModelActionHelpers<TModel extends Model>(
  model: TModel,
  namespaces: string[]
): ModelActionHelpers<TModel> {
  const actions = {
    namespace: namespaces.join("/")
  } as any;

  for (const key of [
    ...Object.keys(model.reducers),
    ...Object.keys(model.effects)
  ]) {
    actions[key] = createActionHelper([...namespaces, key].join("/"));
  }

  for (const key of Object.keys(model.models)) {
    actions[key] = createModelActionHelpers(model.models[key], [
      ...namespaces,
      key
    ]);
  }

  return actions;
}

function registerModelEpics<TDependencies, TModel extends Model<TDependencies>>(
  model: TModel,
  namespaces: string[],
  rootActions: ModelActionHelpers<TModel>,
  rootGetters: ModelGetters<TModel>,
  rootAction$: ActionsObservable<ReduxAction>,
  rootState$: StateObservable<any>,
  dependencies: StoreHelperDependencies<TDependencies>
): Observable<ReduxAction>[] {
  const outputs: Observable<ReduxAction>[] = [];

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
    rootState$.pipe(map((state) => getSubProperty(state, namespaces))) as any,
    getSubProperty(rootState$.value, namespaces)
  );

  const actions: any = getSubProperty(rootActions, namespaces)!;
  const getters = getSubProperty(rootGetters, namespaces)!;

  for (const key of Object.keys(model.effects)) {
    let effect: Effect<any, any, any, any, any, any, any>;
    let operator = mergeMap;

    const effectWithOperator = model.effects[key];
    if (Array.isArray(effectWithOperator)) {
      [effect, operator] = effectWithOperator;
    } else {
      effect = effectWithOperator;
    }

    const action$ = rootAction$.ofType<Action<any>>(
      [...namespaces, key].join("/")
    );

    const output$ = action$.pipe(
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
        filter(
          (action): action is Action<any> =>
            typeof action.type === "string" &&
            action.type.lastIndexOf(namespacePrefix, 0) === 0
        )
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

interface CreateModelRootEpicOptions {
  errorHandler?: (
    err: any,
    caught: Observable<ReduxAction>
  ) => Observable<ReduxAction>;
}

function createModelRootEpic<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  rootActions: ModelActionHelpers<Model<TDependencies>>,
  rootGetters: ModelGetters<Model<TDependencies>>,
  dependencies: StoreHelperDependencies<TDependencies>,
  options: CreateModelRootEpicOptions
): ReduxObservableEpic<ReduxAction, ReduxAction> {
  return (rootAction$, rootState$) =>
    merge(
      ...registerModelEpics(
        model,
        namespaces,
        rootActions,
        rootGetters,
        rootAction$,
        rootState$,
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

function createModelReducer<TDependencies, TModel extends Model<TDependencies>>(
  model: TModel,
  dependencies: TDependencies
): ReduxReducer {
  return ((state: any, action: Action<any>) => {
    state = initializeModelState(state, model, dependencies);

    return produce(state, (draft) => {
      const namespaces = action.type.split("/");
      const stateName = namespaces[namespaces.length - 2];
      const actionType = namespaces[namespaces.length - 1];

      const parentState = getSubProperty(
        draft,
        namespaces.slice(0, namespaces.length - 2)
      );

      const subModel = getSubProperty<Model>(
        model,
        namespaces.slice(0, namespaces.length - 1),
        (o, p) => o.models[p]
      );

      if (actionType === actionTypes.unregister) {
        if (parentState != null) {
          delete parentState[stateName];
        }
      }

      const subState =
        parentState != null && stateName != null
          ? parentState[stateName]
          : parentState;

      const subReducer =
        subModel != null ? subModel.reducers[actionType] : undefined;

      if (subReducer != null) {
        if (subState == null) {
          throw new Error("Failed to handle action: state must be initialized");
        }

        const nextSubState = subReducer(subState, action.payload, dependencies);
        if (nextSubState !== undefined) {
          if (stateName != null) {
            parentState[stateName] = nextSubState;
          } else {
            return nextSubState;
          }
        }
      }
    });
  }) as ReduxReducer;
}

function createModelGetters<TDependencies, TModel extends Model<TDependencies>>(
  model: TModel,
  getState: () => any,
  dependencies: StoreHelperDependencies<TDependencies>,
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
        const state = getSubProperty(rootState, namespaces);

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

function initializeModelState<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  state: ModelState<TModel> | undefined,
  model: TModel,
  dependencies: TDependencies
): ModelState<TModel> {
  if (state === undefined) {
    if (typeof model.state === "function") {
      state = model.state(dependencies);
    } else {
      state = model.state;
    }
  }

  let mutated = false;
  const subStates: { [key: string]: any } = {};
  for (const key of Object.keys(model.models)) {
    const subModel = model.models[key];
    const subState = initializeModelState(state![key], subModel, dependencies);
    if (state![key] !== subState) {
      subStates[key] = subState;
      mutated = true;
    }
  }

  if (mutated) {
    return {
      ...(state as { [key: string]: any }),
      ...subStates
    } as ModelState<TModel>;
  } else {
    return state!;
  }
}

function cloneModel<TModel extends Model>(model: TModel): TModel {
  return {
    state: model.state,
    selectors: { ...model.selectors },
    reducers: { ...model.reducers },
    effects: { ...model.effects },
    epics: [...model.epics],
    models: { ...model.models }
  } as TModel;
}

function getSubProperty<T>(
  obj: T,
  paths: string[],
  map?: (obj: T, path: string) => T
): T | undefined {
  return paths.reduce<T | undefined>(
    (o, path) =>
      o != null ? (map ? map(o, path) : (o as any)[path]) : undefined,
    obj
  );
}
