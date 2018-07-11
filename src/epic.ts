import { Observable, merge } from "rxjs";
import { map, takeUntil, skip, skipWhile } from "rxjs/operators";
import {
  Epic as ReduxObservableEpic,
  ActionsObservable,
  StateObservable
} from "redux-observable";

import { Action, actionTypes } from "./action";
import { Dispatch } from "./dispatch";
import { Reducers } from "./reducer";
import { Model } from "./model";
import { getSubObject } from "./util";

export interface EpicContext<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEpics extends Epics<TDependencies, TState, TReducers, TEpics>,
  TPayload
> {
  action$: ActionsObservable<Action<TPayload>>;
  state$: StateObservable<TState>;
  dispatch: Dispatch<TReducers & TEpics>;
  rootAction$: ActionsObservable<Action<any>>;
  rootState$: StateObservable<any>;
  rootDispatch: Dispatch<any>;
  dependencies: TDependencies;
}

export interface Epic<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEpics extends Epics<TDependencies, TState, TReducers, TEpics>,
  TPayload
> {
  (
    context: EpicContext<TDependencies, TState, TReducers, TEpics, TPayload>
  ): Observable<Action<any>>;
}

export interface Epics<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEpics extends Epics<TDependencies, TState, TReducers, TEpics>
> {
  [type: string]: Epic<TDependencies, TState, TReducers, TEpics, any>;
}

export function registerModelEpics<
  TDependencies,
  TModel extends Model<TDependencies>
>(
  model: TModel,
  namespaces: string[],
  rootDispatch: Dispatch<any>,
  rootAction$: ActionsObservable<Action<any>>,
  rootState$: StateObservable<any>,
  dependencies: TDependencies
): Observable<Action<any>>[] {
  const outputs: Observable<Action<any>>[] = [];

  for (const key of Object.keys(model.models)) {
    const subModel = model.models[key];
    const subOutputs = registerModelEpics(
      subModel,
      [...namespaces, key],
      rootDispatch,
      rootAction$,
      rootState$,
      dependencies
    );

    outputs.push(...subOutputs);
  }

  const takeUntil$ = rootAction$.pipe(
    skipWhile(
      (action) =>
        action.type !== `${namespaces.join("/")}/${actionTypes.unregisterModel}`
    ),
    skip(1)
  );

  rootAction$ = new ActionsObservable(rootAction$.pipe(takeUntil(takeUntil$)));

  rootState$ = new StateObservable(
    rootState$.pipe(takeUntil(takeUntil$)) as any,
    rootState$.value
  );
  const state$ = new StateObservable(
    rootState$.pipe(map((state) => getSubObject(state, namespaces))) as any,
    getSubObject(rootState$.value, namespaces)
  );

  const dispatch = getSubObject(rootDispatch, namespaces);

  for (const key of Object.keys(model.epics)) {
    const epic = model.epics[key];
    const action$ = rootAction$.ofType([...namespaces, key].join("/"));

    outputs.push(
      epic({
        action$,
        state$,
        dispatch,
        rootAction$,
        rootState$,
        rootDispatch,
        dependencies
      } as any)
    );
  }

  return outputs;
}

export function createModelEpic<
  TDependencies,
  TModel extends Model<TDependencies>
>(model: TModel): ReduxObservableEpic<any, Action<any>> {
  return (action$, state$, dependencies) =>
    merge(
      registerModelEpics(model, [], undefined, action$, state$, dependencies)
    );
}
