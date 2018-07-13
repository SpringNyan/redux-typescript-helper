import { Reducer as ReduxReducer } from "redux";
import { Model } from "./model";
export interface Reducer<TDependencies, TState, TPayload> {
    (state: TState, payload: TPayload, dependencies: TDependencies): void | TState;
}
export interface Reducers<TDependencies, TState> {
    [type: string]: Reducer<TDependencies, TState, any>;
}
export declare function createModelReducer<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: TDependencies): ReduxReducer;
