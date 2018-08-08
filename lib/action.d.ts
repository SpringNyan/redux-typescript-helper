import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./epic";
import { Model } from "./model";
export declare const actionTypes: {
    register: string;
    epicEnd: string;
    unregister: string;
};
export interface Action<TPayload> {
    type: string;
    payload: TPayload;
}
export declare type ExtractActionPayload<T extends Action<any> | Reducer<any, any, any> | Effect<any, any, any, any, any, any> | EffectWithOperator<any, any, any, any, any, any>> = T extends Action<infer TPayload> | Reducer<any, any, infer TPayload> | Effect<any, any, any, any, any, infer TPayload> | EffectWithOperator<any, any, any, any, any, infer TPayload> ? TPayload : never;
export interface ActionHelper<TPayload> {
    (payload: TPayload): Action<TPayload>;
    type: string;
    is(action: any): action is Action<TPayload>;
}
export declare function createActionHelper<TPayload>(type: string): ActionHelper<TPayload>;
export declare type ActionHelpers<T extends Reducers<any, any> | Effects<any, any, any, any, any>> = {
    [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>>;
};
export declare type ModelActionHelpers<TModel extends Model<any, any, any, any, any, any>> = ActionHelpers<TModel["reducers"] & TModel["effects"]> & {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model<any, any, any, any, any, any> ? ModelActionHelpers<TModel["models"][K]> : never;
};
