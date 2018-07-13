import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { Store, Reducer as ReduxReducer } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";

import { ModelState } from "./state";
import {
  Action,
  actionTypes,
  ModelActionHelpers,
  createModelActionHelpers
} from "./action";
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
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;

  constructor(
    store: Store,
    model: TModel,
    namespaces: string[],
    actions: ModelActionHelpers<TModel>,
    addEpic$: BehaviorSubject<ReduxObservableEpic>,
    dependencies: TDependencies
  ) {
    this._store = store;
    this._model = model;
    this._namespaces = namespaces;
    this._actions = actions;
    this._addEpic$ = addEpic$;
    this._dependencies = dependencies;

    for (const namespace of Object.keys(model.models)) {
      this._registerNamespace(namespace);
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

  public namespace<K extends Extract<keyof TModel["models"], string>>(
    namespace: K
  ): StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
  public namespace<T extends Model<TDependencies>>(
    namespace: string
  ): StoreHelperWithNamespaces<TDependencies, T>;
  public namespace(namespace: string): StoreHelper<TDependencies, any> {
    return new StoreHelper(
      this._store,
      this._model.models[namespace],
      [...this._namespaces, namespace],
      this._actions[namespace],
      this._addEpic$,
      this._dependencies
    );
  }

  public registerModel<T extends Model>(namespace: string, model: T): void {
    if (this._model.models[namespace] != null) {
      throw new Error("Model is already existing");
    }

    const namespaces = [...this._namespaces, namespace];

    this._model.models[namespace] = cloneModel(model);

    // TODO: add action helpers

    this._addEpic$.next(
      createModelEpic(
        model,
        namespaces,
        this.actions[namespace],
        this._dependencies
      )
    );

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.register}`
    });

    this._registerNamespace(namespace);
  }

  public unregisterModel(namespace: string): void {
    if (this._model.models[namespace] == null) {
      throw new Error("Model is not existing");
    }

    this._unregisterNamespace(namespace);

    const namespaces = [...this._namespaces, namespace];

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.unregister}`
    });

    delete this._model.models[namespace];
    delete this.state[namespace];

    // TODO: delete action helpers
  }

  private _registerNamespace(namespace: string): void {
    Object.defineProperty(this, namespace, {
      get: () => {
        return this.namespace(namespace);
      }
    });
  }

  private _unregisterNamespace(namespace: string): void {
    delete (this as any)[namespace];
  }
}

export type StoreHelperWithNamespaces<
  TDependencies,
  TModel extends Model<TDependencies>
> = StoreHelper<TDependencies, TModel> &
  {
    [K in keyof TModel["models"]]: StoreHelper<
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
  private readonly _epic: ReduxObservableEpic;
  private readonly _addEpic$: BehaviorSubject<ReduxObservableEpic>;

  constructor(model: TModel, dependencies: TDependencies) {
    this._model = model;
    this._dependencies = dependencies;

    this._reducer = createModelReducer(model, dependencies);

    this._actions = createModelActionHelpers(model, []);

    const initialEpic = createModelEpic(model, [], this._actions, dependencies);
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
    return new StoreHelper(
      store,
      this._model,
      [],
      this._actions,
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
