import { BehaviorSubject, Observable } from "rxjs";
import { Store, Reducer as ReduxReducer } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";
import { ModelState } from "./state";
import { ModelActionHelpers, Action } from "./action";
import { ModelGetters } from "./selector";
import { Model } from "./model";
export interface StoreHelperOptions {
    epicErrorHandler?: (err: any, caught: Observable<Action<any>>) => Observable<Action<any>>;
}
export declare class StoreHelper<TDependencies, TModel extends Model<TDependencies>> {
    private readonly _store;
    private readonly _model;
    private readonly _dependencies;
    private readonly _namespaces;
    private readonly _actions;
    private readonly _getters;
    private readonly _rootGetters;
    private readonly _addEpic$;
    private readonly _options;
    private readonly _subStoreHelpers;
    constructor(store: Store, model: TModel, namespaces: string[], actions: ModelActionHelpers<TModel>, getters: ModelGetters<TModel>, rootGetters: ModelGetters<any>, addEpic$: BehaviorSubject<ReduxObservableEpic>, dependencies: TDependencies, options: StoreHelperOptions);
    readonly store: Store;
    readonly state: ModelState<TModel>;
    readonly actions: ModelActionHelpers<TModel>;
    readonly getters: ModelGetters<TModel>;
    namespace<K extends Extract<keyof TModel["models"], string>>(namespace: K): StoreHelperWithNamespaces<TDependencies, TModel["models"][K]>;
    namespace<T extends Model<TDependencies>>(namespace: string): StoreHelperWithNamespaces<TDependencies, T>;
    registerModel<T extends Model>(namespace: string, model: T): void;
    unregisterModel(namespace: string): void;
    private _registerSubStoreHelper;
    private _unregisterSubStoreHelper;
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
