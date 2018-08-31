import { Observable } from "rxjs";
import { Action as ReduxAction, Reducer as ReduxReducer, Store } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";
import { ModelState } from "./state";
import { ModelActionHelpers } from "./action";
import { ModelGetters } from "./selector";
import { Model } from "./model";
export declare type StoreHelperDependencies<TDependencies> = TDependencies & {
    $storeHelper: StoreHelper<TDependencies, Model<TDependencies, unknown, {}, {}, {}, {}>>;
};
export interface StoreHelperOptions {
    epicErrorHandler?: (err: any, caught: Observable<ReduxAction>) => Observable<ReduxAction>;
}
export declare type StoreHelper<TDependencies, TModel extends Model<TDependencies>> = StoreHelperInternal<TDependencies, TModel> & {
    [K in keyof TModel["models"]]: StoreHelper<TDependencies, TModel["models"][K]>;
};
export declare class StoreHelperFactory<TDependencies, TModel extends Model<TDependencies>> {
    private readonly _model;
    private readonly _dependencies;
    private readonly _reducer;
    private readonly _actions;
    private readonly _getters;
    private readonly _epic;
    private readonly _addEpic$;
    private readonly _options;
    private _store?;
    constructor(model: TModel, dependencies: TDependencies, options: StoreHelperOptions);
    readonly reducer: ReduxReducer;
    readonly epic: ReduxObservableEpic;
    create(store: Store): StoreHelper<TDependencies, TModel>;
}
export declare function createStoreHelperFactory<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: TDependencies, options?: StoreHelperOptions): StoreHelperFactory<TDependencies, TModel>;
interface StoreHelperInternal<TDependencies, TModel extends Model<TDependencies>> {
    store: Store;
    state: ModelState<TModel>;
    actions: ModelActionHelpers<TModel>;
    getters: ModelGetters<TModel>;
    namespace<K extends Extract<keyof TModel["models"], string>>(namespace: K): StoreHelper<TDependencies, TModel["models"][K]>;
    namespace<T extends Model<TDependencies> = Model<TDependencies, unknown, {}, {}, {}, {}>>(namespace: string): StoreHelper<TDependencies, T>;
    registerModel<T extends Model<TDependencies>>(namespace: string, model: T): void;
    unregisterModel(namespace: string): void;
}
export {};
