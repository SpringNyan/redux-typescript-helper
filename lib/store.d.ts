import { Observable } from "rxjs";
import { Store, Reducer as ReduxReducer } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";
import { ModelState } from "./state";
import { ModelActionHelpers, Action } from "./action";
import { ModelGetters } from "./selector";
import { Model } from "./model";
export declare type StoreHelperDependencies<TDependencies> = TDependencies & {
    storeHelper: StoreHelper<TDependencies, any>;
};
export interface StoreHelperOptions {
    epicErrorHandler?: (err: any, caught: Observable<Action<any>>) => Observable<Action<any>>;
}
export interface StoreHelper<TDependencies, TModel extends Model<TDependencies>> {
    store: Store;
    state: ModelState<TModel>;
    actions: ModelActionHelpers<TModel>;
    getters: ModelGetters<TModel>;
    namespace<K extends Extract<keyof TModel["models"], string>>(namespace: K): StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
    namespace<T extends Model<TDependencies>>(namespace: string): StoreHelperWithNamespaces<TDependencies, T>;
    namespace(namespace: string): StoreHelper<TDependencies, any>;
    registerModel<T extends Model>(namespace: string, model: T): void;
    unregisterModel(namespace: string): void;
}
export declare type StoreHelperWithNamespaces<TDependencies, TModel extends Model<TDependencies>> = StoreHelper<TDependencies, TModel> & {
    [K in keyof TModel["models"]]: StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
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
    create(store: Store): StoreHelperWithNamespaces<TDependencies, TModel>;
}
export declare function createStoreHelperFactory<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: TDependencies, options?: StoreHelperOptions): StoreHelperFactory<TDependencies, TModel>;
