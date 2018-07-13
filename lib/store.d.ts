import { BehaviorSubject } from "rxjs";
import { Store, Reducer as ReduxReducer } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";
import { ModelState } from "./state";
import { ModelActionHelpers } from "./action";
import { Model } from "./model";
export declare class StoreHelper<TDependencies, TModel extends Model<TDependencies>> {
    private readonly _store;
    private readonly _model;
    private readonly _dependencies;
    private readonly _namespaces;
    private readonly _actions;
    private readonly _addEpic$;
    constructor(store: Store, model: TModel, namespaces: string[], actions: ModelActionHelpers<TModel>, addEpic$: BehaviorSubject<ReduxObservableEpic>, dependencies: TDependencies);
    readonly store: Store;
    readonly state: ModelState<TModel>;
    readonly actions: ModelActionHelpers<TModel>;
    namespace<K extends Extract<keyof TModel["models"], string>>(namespace: K): StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
    namespace<T extends Model<TDependencies>>(namespace: string): StoreHelperWithNamespaces<TDependencies, T>;
    registerModel<T extends Model>(namespace: string, model: T): void;
    unregisterModel(namespace: string): void;
    private _registerNamespace;
    private _unregisterNamespace;
}
export declare type StoreHelperWithNamespaces<TDependencies, TModel extends Model<TDependencies>> = StoreHelper<TDependencies, TModel> & {
    [K in keyof TModel["models"]]: StoreHelper<TDependencies, TModel["models"][K]>;
};
export declare class StoreHelperFactory<TDependencies, TModel extends Model<TDependencies>> {
    private readonly _model;
    private readonly _dependencies;
    private readonly _reducer;
    private readonly _actions;
    private readonly _epic;
    private readonly _addEpic$;
    constructor(model: TModel, dependencies: TDependencies);
    readonly reducer: ReduxReducer;
    readonly epic: ReduxObservableEpic;
    create(store: Store): StoreHelperWithNamespaces<TDependencies, TModel>;
}
export declare function createStoreHelperFactory<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: TDependencies): StoreHelperFactory<TDependencies, TModel>;
