import { Observable, OperatorFunction } from "rxjs";
import { Action as ReduxAction, Dispatch } from "redux";
import { ActionsObservable, StateObservable } from "redux-observable";
import { DeepState } from "./state";
import { Action, DeepActionHelpers } from "./action";
import { Selectors, DeepGetters } from "./selector";
import { Reducers } from "./reducer";
import { Models } from "./model";
import { StoreHelperDependencies } from "./store";
export interface EpicContext<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>> {
    action$: ActionsObservable<Action<unknown>>;
    rootAction$: ActionsObservable<ReduxAction>;
    state$: StateObservable<DeepState<TState, TModels>>;
    rootState$: StateObservable<unknown>;
    actions: DeepActionHelpers<TReducers, TEffects, TModels>;
    rootActions: unknown;
    getters: DeepGetters<TState, TSelectors, TModels>;
    rootGetters: unknown;
    dependencies: StoreHelperDependencies<TDependencies>;
}
export interface Epic<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>): Observable<ReduxAction>;
}
export declare type Epics<TDependencies, TState> = Array<Epic<TDependencies, TState, any, any, any, any>>;
export interface Effect<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>, TPayload> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>, payload: TPayload): Observable<ReduxAction>;
}
export declare type EffectWithOperator<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>, TPayload> = [Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TPayload>, (...args: any[]) => OperatorFunction<Action<TPayload>, Action<TPayload>>];
export interface Effects<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState, any, any>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState, any, any, any, any>, TModels extends Models<TDependencies>> {
    [type: string]: Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, any> | EffectWithOperator<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, any>;
}
export declare function asyncEffect(asyncFn: (dispatch: Dispatch<ReduxAction>) => Promise<void>): Observable<ReduxAction>;
