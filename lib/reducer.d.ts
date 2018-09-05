import { Reducer as ReduxReducer } from "redux";
import { Model } from "./model";
import { StoreHelperDependencies } from "./store";
export interface Reducer<TDependencies = any, TState = any, TPayload = any> {
    (state: TState, payload: TPayload, dependencies: StoreHelperDependencies<TDependencies>): void | TState;
}
export interface Reducers<TDependencies = any, TState = any> {
    [type: string]: Reducer<TDependencies, TState>;
}
export declare function createModelReducer<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: StoreHelperDependencies<TDependencies>): ReduxReducer;
