import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { Reducer as ReduxReducer, Store } from "redux";
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
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
import { getIn } from "./util";

interface StoreHelperInternal<TModel extends Model> {
  state: ModelState<TModel>;
  actions: ModelActionHelpers<TModel>;
  getters: ModelGetters<TModel>;

  $namespace: string;
  $parent: StoreHelper<Model<unknown, unknown, {}, {}, {}, {}, {}>> | null;
  $root: StoreHelper<Model<unknown, unknown, {}, {}, {}, {}, {}>>;
  $child: StoreHelperChild<ExtractModels<TModel>, ExtractDynamicModels<TModel>>;

  $registerModel<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(
    namespace: K,
    model: ExtractDynamicModels<TModel>[K]
  ): void;
  $unregisterModel<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(
    namespace: K
  ): void;
}

export type StoreHelper<TModel extends Model> = StoreHelperInternal<TModel> &
  { [K in keyof ExtractModels<TModel>]: StoreHelper<ExtractModels<TModel>[K]> };

export interface StoreHelperChild<
  TModels extends Models,
  TDynamicModels extends Models
> {
  <K extends keyof TModels>(namespace: K): StoreHelper<TModels[K]>;
  <K extends keyof TDynamicModels>(namespace: K): StoreHelper<
    TDynamicModels[K]
  > | null;
}

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

  private readonly _storeHelper: StoreHelper<TModel>;

  private _store?: Store;

  constructor(
    dependencies: TDependencies,
    model: TModel,
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

    this._actions = createModelActionHelpers(
      this._model,
      this._dependencies,
      [],
      null
    );

    this._getters = createModelGetters(
      this._model,
      this._dependencies,
      [],
      null
    );

    this._storeHelper = new _StoreHelper(
      this._model,
      this._dependencies,
      this._options,
      this._actions,
      this._getters,
      (epic) => this._addEpic$.next(epic),
      [],
      null
    ) as any;
    this._dependencies.$storeHelper = this._storeHelper;

    this._reducer = createModelReducer(this._model, this._dependencies);

    const initialEpic = createModelEpic(
      model,
      this._dependencies,
      this._options.epicErrorHandler || null,
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
    this._dependencies.$store = this._store;

    return this._storeHelper;
  }
}

export function createStoreHelperFactory<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  dependencies: TDependencies,
  model: TModel,
  options?: StoreHelperOptions
): StoreHelperFactory<TDependencies, TModel> {
  if (options == null) {
    options = {};
  }

  return new StoreHelperFactory(dependencies, model, options);
}

class _StoreHelper<TDependencies, TModel extends Model<TDependencies>>
  implements StoreHelperInternal<TModel> {
  private readonly _model: TModel;
  private readonly _dependencies: StoreHelperDependencies<TDependencies>;
  private readonly _options: StoreHelperOptions;
  private readonly _actions: ModelActionHelpers<TModel>;
  private readonly _getters: ModelGetters<TModel>;
  private readonly _addEpic: (epic: ReduxObservableEpic) => void;
  private readonly _namespaces: string[];

  private readonly _subStoreHelpers: {
    [namespace: string]: StoreHelperInternal<Model<TDependencies>>;
  } = {};

  constructor(
    model: TModel,
    dependencies: StoreHelperDependencies<TDependencies>,
    options: StoreHelperOptions,
    actions: ModelActionHelpers<TModel>,
    getters: ModelGetters<TModel>,
    addEpic: (epic: ReduxObservableEpic) => void,
    namespaces: string[],
    parent: StoreHelper<Model> | null
  ) {
    this._model = model;
    this._dependencies = dependencies;
    this._options = options;
    this._actions = actions;
    this._getters = getters;
    this._addEpic = addEpic;
    this._namespaces = namespaces;

    this.$namespace = namespaces.join("/");
    this.$parent = parent;
    this.$root = parent != null ? parent.$root : this;

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

  public readonly $namespace: string;
  public readonly $parent: StoreHelper<
    Model<unknown, unknown, {}, {}, {}, {}, {}>
  > | null;
  public readonly $root: StoreHelper<
    Model<unknown, unknown, {}, {}, {}, {}, {}>
  >;

  public $child<K extends keyof ExtractModels<TModel>>(
    namespace: K
  ): StoreHelper<ExtractModels<TModel>[K]>;
  public $child<K extends keyof ExtractDynamicModels<TModel>>(
    namespace: K
  ): StoreHelper<ExtractDynamicModels<TModel>[K]> | null;
  public $child(
    namespace: string
  ): StoreHelperInternal<Model<TDependencies>> | null {
    const helper = this._subStoreHelpers[namespace];
    return helper != null ? helper : null;
  }

  public $registerModel<
    K extends Extract<keyof ExtractDynamicModels<TModel>, string>
  >(namespace: K, model: ExtractDynamicModels<TModel>[K]): void {
    if (this._model.models[namespace] != null) {
      throw new Error("model is already registered");
    }

    this._model.models[namespace] = model;

    const namespaces = [...this._namespaces, namespace];

    this._actions[namespace] = createModelActionHelpers(
      model,
      this._dependencies,
      namespaces,
      this._actions
    ) as any;

    this._getters[namespace] = createModelGetters(
      model,
      this._dependencies,
      namespaces,
      this._getters
    ) as any;

    this._registerSubStoreHelper(namespace);

    this._addEpic(
      createModelEpic(
        model,
        this._dependencies,
        this._options.epicErrorHandler || null,
        namespaces
      )
    );

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.register}`
    });
  }

  public $unregisterModel<
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
    delete this._actions[namespace];
    delete this._getters[namespace];

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.unregister}`
    });

    delete this._model.models[namespace];
  }

  private get _store(): Store {
    return this._dependencies.$store;
  }

  private _registerSubStoreHelper(namespace: string): void {
    this._subStoreHelpers[namespace] = new _StoreHelper(
      this._model.models[namespace],
      this._dependencies,
      this._options,
      this._actions[namespace],
      this._getters[namespace],
      this._addEpic,
      [...this._namespaces, namespace],
      this as any
    ) as any;

    Object.defineProperty(this, namespace, {
      get: () => {
        return this.$child(namespace);
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
