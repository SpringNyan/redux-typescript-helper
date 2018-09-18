import { Reducer, Reducers, ExtractReducers } from "./reducer";
import { Effect, EffectWithOperator, Effects, ExtractEffects } from "./epic";
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
export declare type ExtractActionPayload<T extends Action | Reducer | Effect | EffectWithOperator> = T extends Action<infer TPayload> | Reducer<any, any, infer TPayload> | Effect<any, any, any, any, any, any, any, infer TPayload> | EffectWithOperator<any, any, any, any, any, any, any, infer TPayload> ? TPayload : never;
export interface ActionHelper<TPayload = any> {
    (payload: TPayload): Action<TPayload>;
    type: string;
    is(action: any): action is Action<TPayload>;
}
export declare function createActionHelper<TPayload>(type: string): ActionHelper<TPayload>;
export declare type ActionHelpers<T extends Reducers | Effects> = {
    [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>>;
};
export declare type DeepActionHelpers<TReducers extends Reducers, TEffects extends Effects, TModels extends Models, TDynamicModels extends Models> = ActionHelpers<TReducers> & ActionHelpers<TEffects> & ModelsActionHelpers<TModels> & {
    $namespace: string;
    $parent: DeepActionHelpers<{}, {}, {}, {}> | null;
    $root: DeepActionHelpers<{}, {}, {}, {}>;
    $child: DeepActionHelpersChild<TModels, TDynamicModels>;
};
export interface DeepActionHelpersChild<TModels extends Models, TDynamicModels extends Models> {
    <K extends Extract<keyof TModels, string>>(namespace: K): ModelActionHelpers<TModels[K]>;
    <K extends Extract<keyof TDynamicModels, string>>(namespace: K): ModelActionHelpers<TDynamicModels[K]> | null;
}
export declare type ModelActionHelpers<TModel extends Model> = DeepActionHelpers<ExtractReducers<TModel>, ExtractEffects<TModel>, ExtractModels<TModel>, ExtractDynamicModels<TModel>>;
export declare type ModelsActionHelpers<TModels extends Models> = {
    [K in keyof TModels]: TModels[K] extends Model ? ModelActionHelpers<TModels[K]> : never;
};
export declare function createModelActionHelpers<TModel extends Model>(model: TModel, namespaces: string[], parent: ModelActionHelpers<Model> | null): ModelActionHelpers<TModel>;
