import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { Store, Reducer as ReduxReducer } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";

import { ModelState } from "./state";
import {
  actionTypes,
  ModelActionHelpers,
  createModelActionHelpers
} from "./action";
import { ModelGetters, createModelGetters } from "./selector";
import { createModelReducer } from "./reducer";
import { createModelEpic } from "./effect";
import { Model, cloneModel } from "./model";
import { getSubObject } from "./util";

export class StoreHelper<TDependencies, TModel extends Model<TDependencies>> {
  private readonly _store: Store;
  private readonly _model: TModel;
  private readonly _dependencies: TDependencies;
  private readonly _namespaces: string[];
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _rootGetters: ModelGetters<any>;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;

  private readonly _subStoreHelpers: {
    [namespace: string]: StoreHelper<TDependencies, any>;
  } = {};

  constructor(
    store: Store,
    model: TModel,
    namespaces: string[],
    actions: ModelActionHelpers<TModel>,
    getters: ModelGetters<TModel>,
    rootGetters: ModelGetters<any>,
    addEpic$: BehaviorSubject<ReduxObservableEpic>,
    dependencies: TDependencies
  ) {
    this._store = store;
    this._model = model;
    this._namespaces = namespaces;
    this._actions = actions;
    this._getters = getters;
    this._rootGetters = rootGetters;
    this._addEpic$ = addEpic$;
    this._dependencies = dependencies;

    for (const namespace of Object.keys(model.models)) {
      this._registerSubStoreHelper(namespace);
    }
  }

  public get store(): Store {
    return this._store;
  }

  public get state(): ModelState<TModel> {
    return getSubObject(this._store.getState(), this._namespaces);
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
  public namespace(namespace: string): StoreHelper<TDependencies, any> {
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
      createModelEpic(
        model,
        namespaces,
        this.actions[namespace],
        this.getters[namespace],
        this._dependencies
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
    this._subStoreHelpers[namespace] = new StoreHelper(
      this._store,
      this._model.models[namespace],
      [...this._namespaces, namespace],
      this._actions[namespace],
      this._getters[namespace],
      this._rootGetters,
      this._addEpic$,
      this._dependencies
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
  private readonly _dependencies: TDependencies;
  private readonly _reducer: ReduxReducer;
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _epic: ReduxObservableEpic;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;

  private _store?: Store;

  constructor(model: TModel, dependencies: TDependencies) {
    this._model = model;
    this._dependencies = dependencies;

    this._reducer = createModelReducer(model, dependencies);

    this._actions = createModelActionHelpers(model, []);
    this._getters = createModelGetters(
      model,
      () => this._store!.getState(),
      this._dependencies,
      [],
      null
    );

    const initialEpic = createModelEpic(
      model,
      [],
      this._actions,
      this._getters,
      dependencies
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

    return new StoreHelper(
      store,
      this._model,
      [],
      this._actions,
      this._getters,
      this._getters,
      this._addEpic$,
      this._dependencies
    ) as StoreHelperWithNamespaces<TDependencies, TModel>;
  }
}

export function createStoreHelperFactory<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  dependencies: TDependencies
): StoreHelperFactory<TDependencies, TModel> {
  return new StoreHelperFactory(model, dependencies);
}
