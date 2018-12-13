import { Dispatch, AnyAction } from "redux";
import { Reducer, Reducers, ExtractReducers } from "./reducer";
import { Effect, Effects, ExtractEffects } from "./epic";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
import { StoreHelperDependencies } from "./store";
declare class ActionDispatchCallback {
    private readonly _itemMap;
    setDispatched(action: AnyAction): void;
    hasDispatched(action: AnyAction): boolean;
    resolve(action: AnyAction): void;
    reject(action: AnyAction, err: unknown): void;
    register(action: AnyAction): Promise<void>;
}
export declare const actionDispatchCallback: ActionDispatchCallback;
export declare const actionTypes: {
    register: string;
    epicEnd: string;
    unregister: string;
};
export interface Action<TPayload = any> {
    type: string;
    payload: TPayload;
}
export declare type ExtractActionPayload<T extends Action | Reducer | Effect> = T extends Action<infer TPayload> | Reducer<any, any, infer TPayload> | Effect<any, any, any, any, any, any, any, infer TPayload> ? TPayload : never;
export declare type ExtractActionPayloads<T extends Reducers | Effects> = {
    [K in keyof T]: ExtractActionPayload<T[K]>;
};
export interface ActionHelper<TPayload = any> {
    (payload: TPayload): Action<TPayload>;
    type: string;
    is(action: any): action is Action<TPayload>;
    dispatch(payload: TPayload, dispatch?: Dispatch): Promise<void>;
}
export declare type ActionHelpers<T> = {
    [K in keyof T]: ActionHelper<T[K]>;
};
export declare type DeepActionHelpers<TReducers extends Reducers, TEffects extends Effects, TModels extends Models, TDynamicModels extends Models> = ActionHelpers<ExtractActionPayloads<TReducers> & ExtractActionPayloads<TEffects>> & ModelsActionHelpers<TModels> & {
    $namespace: string;
    $parent: DeepActionHelpers<{}, {}, {}, {}> | null;
    $root: DeepActionHelpers<{}, {}, {}, {}>;
    $child: DeepActionHelpersChild<TModels, TDynamicModels>;
};
export interface DeepActionHelpersChild<TModels extends Models, TDynamicModels extends Models> {
    <K extends keyof TModels>(namespace: K): ModelActionHelpers<TModels[K]>;
    <K extends keyof TDynamicModels>(namespace: K): ModelActionHelpers<TDynamicModels[K]> | null;
}
export declare type ModelActionHelpers<TModel extends Model> = DeepActionHelpers<ExtractReducers<TModel>, ExtractEffects<TModel>, ExtractModels<TModel>, ExtractDynamicModels<TModel>>;
export declare type ModelsActionHelpers<TModels extends Models> = {
    [K in keyof TModels]: ModelActionHelpers<TModels[K]>;
};
export declare function createActionHelper<TPayload>(type: string, defaultDispatch: Dispatch): ActionHelper<TPayload>;
export declare function createModelActionHelpers<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: StoreHelperDependencies<TDependencies>, namespaces: string[], parent: ModelActionHelpers<Model> | null): ModelActionHelpers<TModel>;
export {};
