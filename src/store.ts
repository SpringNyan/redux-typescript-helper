import produce from "immer";
import { BehaviorSubject, Observable, merge } from "rxjs";
import {
  map,
  mergeMap,
  filter,
  distinctUntilChanged,
  takeUntil,
  catchError
} from "rxjs/operators";
import { Action as ReduxAction, Reducer as ReduxReducer, Store } from "redux";
import {
  Epic as ReduxObservableEpic,
  ActionsObservable,
  StateObservable
} from "redux-observable";
import { createSelector } from "reselect";

import { ModelState } from "./state";
import {
  actionTypes,
  ModelActionHelpers,
  Action,
  createActionHelper
} from "./action";
import { ModelGetters } from "./selector";
import { Effect } from "./epic";
import { Model, ExtractDynamicModels } from "./model";

export type StoreHelperDependencies<TDependencies> = TDependencies & {
  $storeHelper: StoreHelper<Model<TDependencies, unknown, {}, {}, {}, {}, {}>>;
};

export interface StoreHelperOptions {
  epicErrorHandler?: (
    err: any,
    caught: Observable<ReduxAction>
  ) => Observable<ReduxAction>;
}

export type StoreHelper<TModel extends Model> = StoreHelperInternal<TModel> &
  { [K in keyof TModel["models"]]: StoreHelper<TModel["models"][K]> };

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

    this._reducer = createModelReducer(model, this._dependencies);
    this._actions = createModelActionHelpers(model, [], null);
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

  public create(store: Store): StoreHelper<TModel> {
    if (this._store != null) {
      throw new Error("Store helper is already created");
    }

    this._store = store;

    const storeHelper = new _StoreHelper(
      store,
      this._model,
      [],
      this._actions,
      this._getters,
      this._addEpic$,
      this._dependencies,
      this._options
    );

    this._dependencies.$storeHelper = storeHelper as any;

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

interface StoreHelperInternal<TModel extends Model> {
  store: Store;
  state: ModelState<TModel>;
  actions: ModelActionHelpers<TModel>;
  getters: ModelGetters<TModel>;

  namespace<K extends Extract<keyof TModel["models"], string>>(
    namespace: K
  ): StoreHelper<TModel["models"][K]>;
  namespace<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(
    namespace: K
  ): StoreHelper<ExtractDynamicModels<TModel>[K]> | null;

  registerModel<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(
    namespace: K,
    model: ExtractDynamicModels<TModel>[K]
  ): void;
  unregisterModel<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(
    namespace: K
  ): void;
}

class _StoreHelper<TDependencies, TModel extends Model<TDependencies>>
  implements StoreHelperInternal<TModel> {
  private readonly _store: Store;
  private readonly _model: TModel;
  private readonly _dependencies: StoreHelperDependencies<TDependencies>;
  private readonly _namespaces: string[];
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;
  private readonly _options: StoreHelperOptions;

  private readonly _subStoreHelpers: {
    [namespace: string]: StoreHelperInternal<Model<TDependencies>>;
  } = {};

  constructor(
    store: Store,
    model: TModel,
    namespaces: string[],
    actions: ModelActionHelpers<TModel>,
    getters: ModelGetters<TModel>,
    addEpic$: BehaviorSubject<ReduxObservableEpic>,
    dependencies: StoreHelperDependencies<TDependencies>,
    options: StoreHelperOptions
  ) {
    this._store = store;
    this._model = model;
    this._namespaces = namespaces;
    this._actions = actions;
    this._getters = getters;
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
  ): StoreHelper<TModel["models"][K]>;
  public namespace<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(namespace: K): StoreHelper<ExtractDynamicModels<TModel>[K]> | null;
  public namespace(
    namespace: string
  ): StoreHelperInternal<Model<TDependencies>> | null {
    const helper = this._subStoreHelpers[namespace];
    return helper != null ? helper : null;
  }

  public registerModel<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(namespace: K, model: ExtractDynamicModels<TModel>[K]): void {
    if (this._model.models[namespace] != null) {
      throw new Error("Failed to register model: model is already registered");
    }

    const namespaces = [...this._namespaces, namespace];

    this._model.models[namespace] = cloneModel(model);
    this._actions[namespace] = createModelActionHelpers(model, namespaces, this
      ._actions as any) as any;
    this._getters[namespace] = createModelGetters(
      model,
      () => this._store.getState(),
      this._dependencies,
      namespaces,
      this._getters
    ) as any;

    this._addEpic$.next(
      createModelRootEpic(
        model,
        namespaces,
        this._actions.$root as any,
        this._getters.$root as any,
        this._dependencies,
        { errorHandler: this._options.epicErrorHandler }
      )
    );

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.register}`
    });

    this._registerSubStoreHelper(namespace);
  }

  public unregisterModel<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(namespace: K): void {
    if (this._model.models[namespace] == null) {
      throw new Error("Failed to unregister model: model is not existing");
    }

    const namespaces = [...this._namespaces, namespace];

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.epicEnd}`
    });

    this._unregisterSubStoreHelper(namespace);

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
      this._getters[namespace],
      this._addEpic$,
      this._dependencies,
      this._options
    );

    Object.defineProperty(this, namespace, {
      get: () => {
        return this.namespace(namespace as any);
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
  namespaces: string[],
  parent: ModelActionHelpers<any> | null
): ModelActionHelpers<TModel> {
  const actions = {
    $namespace: namespaces.join("/"),
    $parent: parent
  } as any;

  actions.$root = parent != null ? parent.$root : actions;

  for (const key of [
    ...Object.keys(model.reducers),
    ...Object.keys(model.effects)
  ]) {
    actions[key] = createActionHelper([...namespaces, key].join("/"));
  }

  for (const key of Object.keys(model.models)) {
    actions[key] = createModelActionHelpers(
      model.models[key],
      [...namespaces, key],
      actions
    );
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

  const state$ = new StateObservable(
    rootState$.pipe(
      map((state) => getSubProperty(state, namespaces)),
      distinctUntilChanged()
    ) as any,
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
  return (rootAction$, rootState$) => {
    const unregisterType = `${namespaces.join("/")}/${actionTypes.unregister}`;
    const takeUntil$ = rootAction$.pipe(
      filter((action) => action.type === unregisterType)
    );

    return merge(
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
    ).pipe(takeUntil(takeUntil$));
  };
}

function createModelReducer<TDependencies, TModel extends Model<TDependencies>>(
  model: TModel,
  dependencies: StoreHelperDependencies<TDependencies>
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
  parent: ModelGetters<any> | null
): ModelGetters<TModel> {
  const getters = {
    $namespace: namespaces.join("/"),
    get $state() {
      return getSubProperty(getState(), namespaces);
    },
    get $rootState() {
      return getState();
    },
    $parent: parent
  } as any;

  getters.$root = parent != null ? parent.$root : getters;

  const selectors = model.selectors(createSelector);
  for (const key of Object.keys(selectors)) {
    Object.defineProperty(getters, key, {
      get() {
        const rootState = getState();
        const state = getSubProperty(rootState, namespaces);

        return selectors[key]({
          state,
          rootState,
          getters,
          rootGetters: getters.$root,
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
      getters
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
  dependencies: StoreHelperDependencies<TDependencies>
): ModelState<TModel> {
  if (state === undefined) {
    state = model.state(dependencies);
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
    selectors: model.selectors,
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
