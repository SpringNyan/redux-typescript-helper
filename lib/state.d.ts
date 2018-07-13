import { Model } from "./model";
export declare type State<TDependencies, TState> = TState | ((dependencies: TDependencies) => TState);
export declare type ExtractState<TModel extends Model> = TModel extends Model<any, infer TState> ? TState : never;
export declare type ModelState<TModel extends Model> = ExtractState<TModel> & {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model ? ModelState<TModel["models"][K]> : never;
};
export declare function initializeModelState<TDependencies, TModel extends Model<TDependencies>>(state: ModelState<TModel> | undefined, model: TModel, dependencies: TDependencies): ModelState<TModel>;
