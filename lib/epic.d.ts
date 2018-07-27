import { Observable, OperatorFunction } from "rxjs";
import { Dispatch } from "redux";
import { Epic as ReduxObservableEpic, ActionsObservable, StateObservable } from "redux-observable";
import { Action, ActionHelpers, ModelActionHelpers } from "./action";
import { Selectors, Getters, ModelGetters } from "./selector";
import { Reducers } from "./reducer";
import { Model } from "./model";
export interface EpicContext<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects>, TPayload> {
    action$: ActionsObservable<Action<TPayload>>;
    rootAction$: ActionsObservable<Action<any>>;
    state$: StateObservable<TState>;
    rootState$: StateObservable<any>;
    actions: ActionHelpers<TReducers & TEffects>;
    rootActions: ModelActionHelpers<any>;
    getters: Getters<TSelectors>;
    rootGetters: ModelGetters<any>;
    dependencies: TDependencies;
}
export interface Epic<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects>> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, any>): Observable<Action<any>>;
}
export interface Effect<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects>, TPayload> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, any>, payload: TPayload): Observable<Action<any>>;
}
export declare type EffectWithOperator<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects>, TPayload> = [Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TPayload>, (...args: any[]) => OperatorFunction<Action<TPayload>, Action<TPayload>>];
export interface Effects<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, TSelectors>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TSelectors, TReducers, TEffects>> {
    [type: string]: Effect<TDependencies, TState, TSelectors, TReducers, TEffects, any> | EffectWithOperator<TDependencies, TState, TSelectors, TReducers, TEffects, any>;
}
export declare function registerModelEpics<TDependencies, TModel extends Model<TDependencies>>(model: TModel, namespaces: string[], rootActions: ModelActionHelpers<TModel>, rootGetters: ModelGetters<TModel>, rootAction$: ActionsObservable<Action<any>>, rootState$: StateObservable<any>, dependencies: TDependencies): Observable<Action<any>>[];
export interface CreateModelRootEpicOptions {
    errorHandler?: (err: any, caught: Observable<Action<any>>) => Observable<Action<any>>;
}
export declare function createModelRootEpic<TDependencies, TModel extends Model<TDependencies>>(model: TModel, namespaces: string[], actions: ModelActionHelpers<TModel>, getters: ModelGetters<TModel>, dependencies: TDependencies, options: CreateModelRootEpicOptions): ReduxObservableEpic<any, Action<any>>;
export declare function asyncEffect(asyncFn: (dispatch: Dispatch<Action<any>>) => Promise<void>): Observable<Action<any>>;
