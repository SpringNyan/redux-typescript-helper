import { BehaviorSubject, Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { Action as ReduxAction, Reducer as ReduxReducer, Store } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";

import { ModelState } from "./state";
import {
  ModelActionHelpers,
  actionTypes,
  createModelActionHelpers
} from "./action";
import { createModelReducer } from "./reducer";
import { ModelGetters, createModelGetters } from "./selector";
import { ReduxObservableEpicErrorHandler, createModelEpic } from "./epic";
import { Model, ExtractDynamicModels, cloneModel } from "./model";
import { getIn } from "./util";

interface StoreHelperInternal<TModel extends Model> {
  state: ModelState<TModel>;
  actions: ModelActionHelpers<TModel>;
  getters: ModelGetters<TModel>;

  child<K extends Extract<keyof TModel["models"], string>>(
    namespace: K
  ): StoreHelper<TModel["models"][K]>;
  child<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(
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

export type StoreHelper<TModel extends Model> = StoreHelperInternal<TModel> &
  { [K in keyof TModel["models"]]: StoreHelper<TModel["models"][K]> };

export type StoreHelperDependencies<TDependencies> = TDependencies & {
  $store: Store<unknown>;
  $storeHelper: StoreHelper<Model<TDependencies, unknown, {}, {}, {}, {}, {}>>;
};

export interface StoreHelperOptions {
  epicErrorHandler?: ReduxObservableEpicErrorHandler;
}

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

    this._reducer = createModelReducer(this._model, this._dependencies);
    this._actions = createModelActionHelpers(this._model, [], null);
    this._getters = createModelGetters(
      this._model,
      this._dependencies,
      () => this._store!.getState(),
      [],
      null
    );

    const initialEpic = createModelEpic(
      model,
      this._dependencies,
      this._options.epicErrorHandler || null,
      this._actions,
      this._getters,
      []
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
      throw new Error("store helper is already created");
    }

    this._store = store;

    const storeHelper = new _StoreHelper(
      this._store,
      this._model,
      this._dependencies,
      this._options,
      this._actions,
      this._getters,
      this._addEpic$,
      []
    );

    this._dependencies.$store = store;
    this._dependencies.$storeHelper = storeHelper;

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
  implements StoreHelperInternal<TModel> {
  private readonly _store: Store;
  private readonly _model: TModel;
  private readonly _dependencies: StoreHelperDependencies<TDependencies>;
  private readonly _options: StoreHelperOptions;
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;
  private readonly _namespaces: string[];

  private readonly _subStoreHelpers: {
    [namespace: string]: StoreHelperInternal<Model<TDependencies>>;
  } = {};

  constructor(
    store: Store,
    model: TModel,
    dependencies: StoreHelperDependencies<TDependencies>,
    options: StoreHelperOptions,
    actions: ModelActionHelpers<TModel>,
    getters: ModelGetters<TModel>,
    addEpic$: BehaviorSubject<ReduxObservableEpic>,
    namespaces: string[]
  ) {
    this._store = store;
    this._model = model;
    this._dependencies = dependencies;
    this._options = options;
    this._actions = actions;
    this._getters = getters;
    this._addEpic$ = addEpic$;
    this._namespaces = namespaces;

    for (const namespace of Object.keys(model.models)) {
      this._registerSubStoreHelper(namespace);
    }
  }

  public get state(): ModelState<TModel> {
    return getIn(this._store.getState(), this._namespaces);
  }

  public get actions(): ModelActionHelpers<TModel> {
    return this._actions;
  }

  public get getters(): ModelGetters<TModel> {
    return this._getters;
  }

  public child<K extends Extract<keyof TModel["models"], string>>(
    namespace: K
  ): StoreHelper<TModel["models"][K]>;
  public child<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(
    namespace: K
  ): StoreHelper<ExtractDynamicModels<TModel>[K]> | null;
  public child(
    namespace: string
  ): StoreHelperInternal<Model<TDependencies>> | null {
    const helper = this._subStoreHelpers[namespace];
    return helper != null ? helper : null;
  }

  public registerModel<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(namespace: K, model: ExtractDynamicModels<TModel>[K]): void {
    if (this._model.models[namespace] != null) {
      throw new Error("model is already registered");
    }

    this._model.models[namespace] = model;

    const namespaces = [...this._namespaces, namespace];

    this._actions[namespace] = createModelActionHelpers(
      model,
      namespaces,
      this._actions
    ) as any;

    this._getters[namespace] = createModelGetters(
      model,
      this._dependencies,
      () => this._store.getState(),
      namespaces,
      this._getters
    ) as any;

    this._addEpic$.next(
      createModelEpic(
        model,
        this._dependencies,
        this._options.epicErrorHandler || null,
        this._actions.$root as any,
        this._getters.$root as any,
        namespaces
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
      throw new Error("model is already unregistered");
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
      this._dependencies,
      this._options,
      this._actions[namespace],
      this._getters[namespace],
      this._addEpic$,
      [...this._namespaces, namespace]
    ) as any;

    Object.defineProperty(this, namespace, {
      get: () => {
        return this.child(namespace as any);
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
