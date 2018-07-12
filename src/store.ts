import { BehaviorSubject } from "rxjs";
import { Store } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";

import { ModelState } from "./state";
import {
  actionTypes,
  ModelActionHelpers,
  createModelActionHelpers
} from "./action";
import { createModelEpic } from "./effect";
import { Model, cloneModel } from "./model";

export class StoreHelper<TModel extends Model> {
  private readonly _store: Store;
  private readonly _model: TModel;
  private readonly _namespaces: string[];
  private readonly _epic$: BehaviorSubject<ReduxObservableEpic>;

  constructor(
    store: Store,
    model: TModel,
    namespaces: string[],
    epic$: BehaviorSubject<ReduxObservableEpic>
  ) {
    this._store = store;
    this._model = model;
    this._namespaces = namespaces;
    this._epic$ = epic$;
  }

  public getState(): ModelState<TModel> {
    return this._namespaces.reduce(
      (state, namespace) => (state != null ? state[namespace] : undefined),
      this._store.getState()
    );
  }

  public get actions(): ModelActionHelpers<TModel> {
    return createModelActionHelpers(this._model, this._namespaces);
  }

  public registerModel<T extends Model>(namespace: string, model: T): void {
    if (this._model.models[namespace] != null) {
      throw new Error("Model is already existing");
    }

    const namespaces = [...this._namespaces, namespace];

    this._model.models[namespace] = cloneModel(model);

    this._epic$.next(
      createModelEpic(model, namespaces, this.actions[namespace])
    );

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.registerModel}`
    });
  }

  public unregisterModel(namespace: string): void {
    if (this._model.models[namespace] == null) {
      throw new Error("Model is not existing");
    }

    const namespaces = [...this._namespaces, namespace];

    this._store.dispatch({
      type: `${namespaces.join("/")}/${actionTypes.unregisterModel}`
    });

    delete this._model.models[namespace];
    // TODO: delete state, dispatch
  }
}
