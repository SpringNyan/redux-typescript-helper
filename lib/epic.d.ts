import { Observable } from "rxjs";
import { Action as ReduxAction, Dispatch } from "redux";
import { ActionsObservable, StateObservable, Epic as ReduxObservableEpic } from "redux-observable";
import { DeepState } from "./state";
import { Action, DeepActionHelpers, ExtractActionPayload } from "./action";
import { Selectors, DeepGetters } from "./selector";
import { Reducers } from "./reducer";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
import { StoreHelper, StoreHelperDependencies } from "./store";
export interface EpicContext<TDependencies, TState, TSelectors extends Selectors<TDependencies, TState>, TReducers extends Reducers<TDependencies, TState>, TEffects extends Effects<TDependencies, TState>, TModels extends Models<TDependencies>, TDynamicModels extends Models<TDependencies>> {
    action$: ActionsObservable<Action<unknown>>;
    rootAction$: ActionsObservable<ReduxAction>;
    state$: StateObservable<DeepState<TState, TModels>>;
    rootState$: StateObservable<unknown>;
    helper: StoreHelper<Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>>;
    actions: DeepActionHelpers<TReducers, TEffects, TModels, TDynamicModels>;
    getters: DeepGetters<TState, TSelectors, TModels, TDynamicModels>;
    dispatch: DeepActionDispatchers<TEffects, TModels, TDynamicModels>;
    dependencies: StoreHelperDependencies<TDependencies>;
}
export interface Epic<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>): Observable<ReduxAction>;
}
export declare type Epics<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> = Array<Epic<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>>;
export interface Effect<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any, TPayload = any, TResult = any> {
    (context: EpicContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>, payload: TPayload): (dispatch: Dispatch<ReduxAction>) => Promise<TResult>;
}
export interface Effects<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    [type: string]: Effect<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
}
export declare type ExtractEffectResult<T extends Effect> = T extends Effect<any, any, any, any, any, any, any, any, infer TResult> ? TResult : never;
export declare type ExtractEffects<T extends Model> = T extends Model<any, any, any, any, infer TEffects, any, any> ? TEffects : never;
export interface ActionDispatcher<TPayload = any, TResult = any> {
    (payload: TPayload): Promise<TResult>;
}
export declare type ActionDispatchers<TEffects extends Effects> = {
    [K in keyof TEffects]: ActionDispatcher<ExtractActionPayload<TEffects[K]>, ExtractEffectResult<TEffects[K]>>;
};
export declare type DeepActionDispatchers<TEffects extends Effects, TModels extends Models, TDynamicModels extends Models> = ActionDispatchers<TEffects> & ModelsActionDispatchers<TModels> & {
    $namespace: string;
    $parent: DeepActionDispatchers<{}, {}, {}> | null;
    $root: DeepActionDispatchers<{}, {}, {}>;
    $child: DeepActionDispatchersChild<TModels, TDynamicModels>;
};
export interface DeepActionDispatchersChild<TModels extends Models, TDynamicModels extends Models> {
    <K extends keyof TModels>(namespace: K): ModelActionDispatchers<TModels[K]>;
    <K extends keyof TDynamicModels>(namespace: K): ModelActionDispatchers<TDynamicModels[K]> | null;
}
export declare type ModelActionDispatchers<TModel extends Model> = DeepActionDispatchers<ExtractEffects<TModel>, ExtractModels<TModel>, ExtractDynamicModels<TModel>>;
export declare type ModelsActionDispatchers<TModels extends Models> = {
    [K in keyof TModels]: TModels[K] extends Model ? ModelActionDispatchers<TModels[K]> : never;
};
export declare type ReduxObservableEpicErrorHandler = (err: any, caught: Observable<ReduxAction>) => Observable<ReduxAction>;
export declare function toActionObservable(asyncEffect: (dispatch: Dispatch<ReduxAction>) => Promise<any>): Observable<ReduxAction>;
export declare function createModelActionDispatchers<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: StoreHelperDependencies<TDependencies>, namespaces: string[], parent: ModelActionDispatchers<Model> | null): ModelActionDispatchers<TModel>;
export declare function createModelEpic<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: StoreHelperDependencies<TDependencies>, errorHandler: ReduxObservableEpicErrorHandler | null, namespaces: string[]): ReduxObservableEpic<ReduxAction, ReduxAction>;
