import { Reducer as ReduxReducer, Store } from "redux";
import { Epic as ReduxObservableEpic } from "redux-observable";
import { ModelState } from "./state";
import { ModelActionHelpers } from "./action";
import { ModelGetters } from "./selector";
import { ReduxObservableEpicErrorHandler } from "./epic";
import { Model, Models, ExtractDynamicModels } from "./model";
interface StoreHelperInternal<TModel extends Model> {
    state: ModelState<TModel>;
    actions: ModelActionHelpers<TModel>;
    getters: ModelGetters<TModel>;
    $namespace: string;
    $parent: StoreHelper<Model<unknown, unknown, {}, {}, {}, {}, {}>> | null;
    $root: StoreHelper<Model<unknown, unknown, {}, {}, {}, {}, {}>>;
    $child: StoreHelperChild<TModel["models"], ExtractDynamicModels<TModel>>;
    $registerModel<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(namespace: K, model: ExtractDynamicModels<TModel>[K]): void;
    $unregisterModel<K extends Extract<keyof ExtractDynamicModels<TModel>, string>>(namespace: K): void;
}
export declare type StoreHelper<TModel extends Model> = StoreHelperInternal<TModel> & {
    [K in keyof TModel["models"]]: StoreHelper<TModel["models"][K]>;
};
export interface StoreHelperChild<TModels extends Models, TDynamicModels extends Models> {
    <K extends Extract<keyof TModels, string>>(namespace: K): StoreHelper<TModels[K]>;
    <K extends Extract<keyof TDynamicModels, string>>(namespace: K): StoreHelper<TDynamicModels[K]> | null;
}
export declare type StoreHelperDependencies<TDependencies> = TDependencies & {
    $store: Store<unknown>;
    $storeHelper: StoreHelper<Model<TDependencies, unknown, {}, {}, {}, {}, {}>>;
};
export interface StoreHelperOptions {
    epicErrorHandler?: ReduxObservableEpicErrorHandler;
}
export declare class StoreHelperFactory<TDependencies, TModel extends Model<TDependencies>> {
    private readonly _model;
    private readonly _dependencies;
    private readonly _reducer;
    private readonly _actions;
    private readonly _getters;
    private readonly _epic;
    private readonly _addEpic$;
    private readonly _options;
    private readonly _storeHelper;
    private _store?;
    constructor(model: TModel, dependencies: TDependencies, options: StoreHelperOptions);
    readonly reducer: ReduxReducer;
    readonly epic: ReduxObservableEpic;
    create(store: Store): StoreHelper<TModel>;
}
export declare function createStoreHelperFactory<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: TDependencies, options?: StoreHelperOptions): StoreHelperFactory<TDependencies, TModel>;
export {};
