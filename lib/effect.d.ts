import { Observable } from "rxjs";
import { Epic as ReduxObservableEpic, ActionsObservable, StateObservable } from "redux-observable";
import { Action, ActionHelpers, ModelActionHelpers } from "./action";
import { Reducers } from "./reducer";
import { Model } from "./model";
export interface EffectContext<TDependencies, TState, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TReducers, TEffects>, TPayload> {
    action$: ActionsObservable<Action<TPayload>>;
    rootAction$: ActionsObservable<Action<any>>;
    state$: StateObservable<TState>;
    rootState$: StateObservable<any>;
    actions: ActionHelpers<TReducers & TEffects>;
    rootActions: ModelActionHelpers<any>;
    dependencies: TDependencies;
}
export interface Effect<TDependencies, TState, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TReducers, TEffects>, TPayload> {
    (context: EffectContext<TDependencies, TState, TReducers, TEffects, any>, payload: TPayload): Observable<Action<any>>;
}
export declare type EffectWithOperator<TDependencies, TState, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TReducers, TEffects>, TPayload> = [Effect<TDependencies, TState, TReducers, TEffects, TPayload>, Function];
export interface Effects<TDependencies, TState, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, TReducers, TEffects>> {
    [type: string]: Effect<TDependencies, TState, TReducers, TEffects, any> | EffectWithOperator<TDependencies, TState, TReducers, TEffects, any>;
}
export declare function registerModelEffects<TDependencies, TModel extends Model<TDependencies>>(model: TModel, namespaces: string[], rootActions: ModelActionHelpers<TModel>, rootAction$: ActionsObservable<Action<any>>, rootState$: StateObservable<any>, dependencies: TDependencies): Observable<Action<any>>[];
export declare function createModelEpic<TDependencies, TModel extends Model<TDependencies>>(model: TModel, namespaces: string[], actions: ModelActionHelpers<TModel>, dependencies: TDependencies): ReduxObservableEpic<any, Action<any>>;
