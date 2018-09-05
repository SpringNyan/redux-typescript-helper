import { StoreHelperDependencies } from "./store";
export interface Reducer<TDependencies = any, TState = any, TPayload = any> {
    (state: TState, payload: TPayload, dependencies: StoreHelperDependencies<TDependencies>): void | TState;
}
export interface Reducers<TDependencies = any, TState = any> {
    [type: string]: Reducer<TDependencies, TState>;
}
