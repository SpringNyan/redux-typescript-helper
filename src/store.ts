import produce from "immer";
import { BehaviorSubject } from "rxjs";
import { Store, Reducer as ReduxReducer } from "redux";
import { Epic as ReduxObservableEpic, StateObservable } from "redux-observable";

import { ModelState } from "./state";
import { Action } from "./action";
import { ModelDispatch, createModelDispatch } from "./dispatch";
import { Reducers } from "./reducer";
import { Epics } from "./epic";
import { Model, Models, cloneModel } from "./model";

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

  public get dispatch(): ModelDispatch<TModel> {
    return createModelDispatch(
      this._model,
      this._namespaces,
      this._store.dispatch.bind(this._store)
    );
  }

  public registerModel<T extends Model>(namespace: string, model: T): void {
    if (this._model.models[namespace] != null) {
      throw new Error("Model is already existing");
    }

    this._model.models[namespace] = cloneModel(model);
  }
}
