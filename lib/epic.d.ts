import { Observable, OperatorFunction } from "rxjs";
import { Action as ReduxAction, Dispatch } from "redux";
import { ActionsObservable, StateObservable, Epic as ReduxObservableEpic } from "redux-observable";
import { DeepState } from "./state";
import { Action, DeepActionHelpers, ModelActionHelpers } from "./action";
import { Selectors, DeepGetters, ModelGetters } from "./selector";
import { Reducers } from "./reducer";
import { Model, Models } from "./model";
import { StoreHelperDependencies } from "./store";
export interface EpicContext<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState>, TModels extends Models<TDependencies>, TDynamicModels extends Models<TDependencies>> {
    action$: ActionsObservable<Action<unknown>>;
    rootAction$: ActionsObservable<ReduxAction>;
    state$: StateObservable<DeepState<TState, TModels>>;
    rootState$: StateObservable<unknown>;
    actions: DeepActionHelpers<TReducers, TEffects, TModels, TDynamicModels>;
    rootActions: unknown;
    getters: DeepGetters<TState, TSelectors, TModels, TDynamicModels>;
    rootGetters: unknown;
    dependencies: StoreHelperDependencies<TDependencies>;
}
export interface Epic<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>): Observable<ReduxAction>;
}
export declare type Epics<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> = Array<Epic<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>>;
export interface Effect<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any, TPayload = any> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>, payload: TPayload): Observable<ReduxAction>;
}
export declare type EffectWithOperator<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any, TPayload = any> = [Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TPayload>, (...args: any[]) => OperatorFunction<Action<TPayload>, Action<TPayload>>];
export interface Effects<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    [type: string]: Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels> | EffectWithOperator<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
}
export declare type ReduxObservableEpicErrorHandler = (err: any, caught: Observable<ReduxAction>) => Observable<ReduxAction>;
export declare function asyncEffect(asyncFn: (dispatch: Dispatch<ReduxAction>) => Promise<void>): Observable<ReduxAction>;
export declare function createModelEpic<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: StoreHelperDependencies<TDependencies>, errorHandler: ReduxObservableEpicErrorHandler | null, rootActions: ModelActionHelpers<Model<TDependencies>>, rootGetters: ModelGetters<Model<TDependencies>>, namespaces: string[]): ReduxObservableEpic<ReduxAction, ReduxAction>;
