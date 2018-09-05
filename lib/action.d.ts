import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./epic";
import { Model, Models } from "./model";
export declare const actionTypes: {
    register: string;
    epicEnd: string;
    unregister: string;
};
export interface Action<TPayload> {
    type: string;
    payload: TPayload;
}
export declare type ExtractActionPayload<T extends Action<any> | Reducer | Effect<any, any, any, any, any, any, any> | EffectWithOperator<any, any, any, any, any, any, any>> = T extends Action<infer TPayload> | Reducer<any, any, infer TPayload> | Effect<any, any, any, any, any, any, infer TPayload> | EffectWithOperator<any, any, any, any, any, any, infer TPayload> ? TPayload : never;
export interface ActionHelper<TPayload> {
    (payload: TPayload): Action<TPayload>;
    type: string;
    is(action: any): action is Action<TPayload>;
}
export declare function createActionHelper<TPayload>(type: string): ActionHelper<TPayload>;
export declare type ActionHelpers<T extends Reducers | Effects<any, any, any, any, any, any>> = {
    [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>>;
};
export declare type DeepActionHelpers<TReducers extends Reducers, TEffects extends Effects<any, any, any, any, any, any>, TModels extends Models<any>> = ActionHelpers<TReducers> & ActionHelpers<TEffects> & ModelsActionHelpers<TModels> & {
    $namespace: string;
    $parent: unknown;
    $root: unknown;
};
export declare type ModelActionHelpers<TModel extends Model> = DeepActionHelpers<TModel["reducers"], TModel["effects"], TModel["models"]>;
export declare type ModelsActionHelpers<TModels extends Models<any>> = {
    [K in keyof TModels]: TModels[K] extends Model ? ModelActionHelpers<TModels[K]> : never;
};
