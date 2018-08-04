import { StoreHelperDependencies } from "./store";
export interface Reducer<TDependencies, TState, TPayload> {
    (state: TState, payload: TPayload, dependencies: StoreHelperDependencies<TDependencies>): void | TState;
}
export interface Reducers<TDependencies, TState> {
    [type: string]: Reducer<TDependencies, TState, any>;
}
