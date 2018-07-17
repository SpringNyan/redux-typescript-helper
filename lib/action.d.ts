import { Dispatch } from "redux";
import { Reducer, Reducers } from "./reducer";
import { Effect, EffectWithOperator, Effects } from "./effect";
import { Model } from "./model";
export declare const actionTypes: {
    register: string;
    unregister: string;
};
export interface Action<TPayload> {
    type: string;
    payload: TPayload;
}
export declare type ExtractActionPayload<T extends Reducer<any, any, any> | Effect<any, any, any, any, any, any> | EffectWithOperator<any, any, any, any, any, any>> = T extends Reducer<any, any, infer TPayload> | Effect<any, any, any, any, any, infer TPayload> | EffectWithOperator<any, any, any, any, any, infer TPayload> ? TPayload : any;
export declare class ActionHelper<TPayload> {
    readonly type: string;
    private readonly _dispatch;
    constructor(type: string, dispatch: Dispatch);
    create(payload: TPayload): Action<TPayload>;
    dispatch(payload: TPayload): Action<TPayload>;
    is(action: any): action is Action<TPayload>;
}
export declare type ActionHelpers<T extends Reducers<any, any> | Effects<any, any, any, any, any>> = {
    [K in keyof T]: ActionHelper<ExtractActionPayload<T[K]>>;
};
export declare type ModelActionHelpers<TModel extends Model> = ActionHelpers<TModel["reducers"] & TModel["effects"]> & {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model ? ModelActionHelpers<TModel["models"][K]> : never;
};
export declare function createModelActionHelpers<TModel extends Model>(model: TModel, namespaces: string[], dispatch: Dispatch): ModelActionHelpers<TModel>;
