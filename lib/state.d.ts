import { Model } from "./model";
export declare type State<TDependencies, TState> = TState | ((dependencies: TDependencies) => TState);
export declare type ExtractState<T extends State<any, any> | Model> = T extends State<any, infer TState> | Model<any, infer TState> ? TState : never;
export declare type ModelState<TModel extends Model> = ExtractState<TModel> & {
    [K in keyof TModel["models"]]: TModel["models"][K] extends Model ? ModelState<TModel["models"][K]> : never;
};
