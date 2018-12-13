import { ModelState, DeepState } from "./state";
import { DeepActionHelpers } from "./action";
import { Reducers } from "./reducer";
import { Effects } from "./epic";
import { Model, Models, ExtractModels, ExtractDynamicModels } from "./model";
import { StoreHelperDependencies, StoreHelper } from "./store";
export interface SelectorContext<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    state: DeepState<TState, TModels>;
    rootState: unknown;
    helper: StoreHelper<Model<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>>;
    actions: DeepActionHelpers<TReducers, TEffects, TModels, TDynamicModels>;
    getters: DeepGetters<TState, TSelectors, TModels, TDynamicModels>;
    dependencies: StoreHelperDependencies<TDependencies>;
}
export interface Selector<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any, TResult = any> {
    (context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>): TResult;
}
export interface Selectors<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    [name: string]: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>;
}
export declare type SelectorsFactory<TSelectors extends Selectors = Selectors, TSelectorCreator extends SelectorCreator = SelectorCreator> = ((selectorCreator: TSelectorCreator) => TSelectors);
export declare type ExtractSelectors<T extends SelectorsFactory | Model> = T extends SelectorsFactory<infer TSelectors, any> | Model<any, any, infer TSelectors, any, any, any, any> ? TSelectors : never;
export declare type ExtractSelectorResult<T extends Selector> = T extends Selector<any, any, any, any, any, any, any, infer TResult> ? TResult : never;
export declare type Getters<T extends Selectors> = {
    [K in keyof T]: ExtractSelectorResult<T[K]>;
};
export declare type DeepGetters<TState, TSelectors extends Selectors, TModels extends Models, TDynamicModels extends Models> = Getters<TSelectors> & ModelsGetters<TModels> & {
    state: TState;
    $namespace: string;
    $parent: DeepGetters<unknown, {}, {}, {}> | null;
    $root: DeepGetters<unknown, {}, {}, {}>;
    $child: DeepGettersChild<TModels, TDynamicModels>;
};
export interface DeepGettersChild<TModels extends Models, TDynamicModels extends Models> {
    <K extends keyof TModels>(namespace: K): ModelGetters<TModels[K]>;
    <K extends keyof TDynamicModels>(namespace: K): ModelGetters<TDynamicModels[K]> | null;
}
export declare type ModelGetters<TModel extends Model> = DeepGetters<ModelState<TModel>, ExtractSelectors<TModel>, ExtractModels<TModel>, ExtractDynamicModels<TModel>>;
export declare type ModelsGetters<TModels extends Models> = {
    [K in keyof TModels]: ModelGetters<TModels[K]>;
};
export interface SelectorCreator<TDependencies = any, TState = any, TSelectors extends Selectors<TDependencies, TState> = any, TReducers extends Reducers<TDependencies, TState> = any, TEffects extends Effects<TDependencies, TState> = any, TModels extends Models<TDependencies> = any, TDynamicModels extends Models<TDependencies> = any> {
    <T1, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, combiner: (res1: T1, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, combiner: (res1: T1, res2: T2, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, combiner: (res1: T1, res2: T2, res3: T3, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, T4, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, selector4: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T4>, combiner: (res1: T1, res2: T2, res3: T3, res4: T4, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, T4, T5, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, selector4: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T4>, selector5: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T5>, combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, T4, T5, T6, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, selector4: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T4>, selector5: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T5>, selector6: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T6>, combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5, res6: T6, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, T4, T5, T6, T7, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, selector4: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T4>, selector5: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T5>, selector6: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T6>, selector7: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T7>, combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5, res6: T6, res7: T7, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, T4, T5, T6, T7, T8, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, selector4: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T4>, selector5: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T5>, selector6: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T6>, selector7: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T7>, selector8: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T8>, combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5, res6: T6, res7: T7, res8: T8, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(selector1: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T1>, selector2: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T2>, selector3: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T3>, selector4: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T4>, selector5: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T5>, selector6: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T6>, selector7: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T7>, selector8: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T8>, selector9: Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, T9>, combiner: (res1: T1, res2: T2, res3: T3, res4: T4, res5: T5, res6: T6, res7: T7, res8: T8, res9: T9, context: SelectorContext<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels>) => TResult): Selector<TDependencies, TState, TSelectors, TReducers, TEffects, TModels, TDynamicModels, TResult>;
}
export declare function createModelGetters<TDependencies, TModel extends Model<TDependencies>>(model: TModel, dependencies: StoreHelperDependencies<TDependencies>, namespaces: string[], parent: ModelGetters<Model<TDependencies>> | null): ModelGetters<TModel>;
