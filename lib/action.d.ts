import { Reducer, Reducers, ExtractReducers } from "./reducer";
import { Effect, Effects, ExtractEffects } from "./epic";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
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
    [K in keyof TModels]: TModels[K] extends Model ? ModelActionHelpers<TModels[K]> : never;
};
export declare function createActionHelper<TPayload>(type: string): ActionHelper<TPayload>;
export declare function createModelActionHelpers<TModel extends Model>(model: TModel, namespaces: string[], parent: ModelActionHelpers<Model> | null): ModelActionHelpers<TModel>;
