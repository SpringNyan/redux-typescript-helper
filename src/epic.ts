import { Observable } from "rxjs";
import { ActionsObservable, StateObservable } from "redux-observable";

import { Action, Dispatch } from "./action";
import { Reducers } from "./reducer";

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
