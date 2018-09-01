import { createSelector } from "reselect";

import { State } from "./state";
import { Selectors, SelectorCreator } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epic } from "./epic";

export interface Model<
  TDependencies = any,
  TState = any,
  TSelectors extends Selectors<TDependencies, TState, any, any> = Selectors<
    TDependencies,
    TState,
    any,
    any
  >,
  TReducers extends Reducers<TDependencies, TState> = Reducers<
    TDependencies,
    TState
  >,
  TEffects extends Effects<TDependencies, TState, any, any, any, any> = Effects<
    TDependencies,
    TState,
    any,
    any,
    any,
    any
  >,
  TModels extends Models<TDependencies> = Models<TDependencies>,
  TDynamicModels extends Models<TDependencies> = Models<TDependencies>
> {
  state: State<TDependencies, TState>;
  selectors: TSelectors;
  reducers: TReducers;
  effects: TEffects;
  epics: Array<Epic<TDependencies, TState, any, any, any, any>>;
  models: TModels;
}

export type Models<TDependencies> = {
  [key: string]: Model<TDependencies>;
};

export type ExtractDynamicModels<
  T extends Model<any, any, any, any, any, any, any>
> = T extends Model<any, any, any, any, any, any, infer TDynamicModels>
  ? TDynamicModels
  : never;

export class ModelBuilder<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>,
  TDynamicModels extends Models<TDependencies>
> {
  private readonly _state: State<TDependencies, TState>;
  private _selectors: Selectors<
    TDependencies,
    TState,
    TSelectors,
    TModels
  > = {};
  private _reducers: Reducers<TDependencies, TState> = {};
  private _effects: Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels
  > = {};
  private _epics: Array<
    Epic<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>
  > = [];
  private _models: Models<TDependencies> = {};

  constructor(state: State<TDependencies, TState>) {
    this._state = state;
  }

  public selectors<
    T extends Selectors<TDependencies, TState, TSelectors, TModels>
  >(
    selectors:
      | T
      | ((
          selectorCreator: SelectorCreator<
            TDependencies,
            TState,
            TSelectors,
            TModels
          >
        ) => T)
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors & T,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    if (typeof selectors === "function") {
      selectors = selectors(createSelector);
    }

    this._selectors = {
      ...this._selectors,
      ...(selectors as Selectors<TDependencies, TState, TSelectors, TModels>)
    };

    return this as any;
  }

  public reducers<T extends Reducers<TDependencies, TState>>(
    reducers: T
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers & T,
    TEffects,
    TModels,
    TDynamicModels
  > {
    this._reducers = {
      ...this._reducers,
      ...(reducers as Reducers<TDependencies, TState>)
    };

    return this as any;
  }

  public effects<
    T extends Effects<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels
    >
  >(
    effects: T
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects & T,
    TModels,
    TDynamicModels
  > {
    this._effects = {
      ...this._effects,
      ...(effects as Effects<
        TDependencies,
        TState,
        TSelectors,
        TReducers,
        TEffects,
        TModels
      >)
    };

    return this as any;
  }

  public epics(
    epics: Array<
      Epic<TDependencies, TState, TSelectors, TReducers, TEffects, TModels>
    >
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    this._epics = [...this._epics, ...epics];

    return this as any;
  }

  public models<T extends Models<TDependencies>>(
    models: T
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels & T,
    TDynamicModels
  > {
    this._models = {
      ...this._models,
      ...(models as Models<TDependencies>)
    };

    return this as any;
  }

  public dynamicModels<T extends Models<TDependencies>>(): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    T
  > {
    return this as any;
  }

  public build(): Model<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    return {
      state: this._state,
      selectors: { ...this._selectors },
      reducers: { ...this._reducers },
      effects: { ...this._effects },
      epics: [...this._epics],
      models: { ...this._models }
    } as Model<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >;
  }
}

function createModelBuilder<TDependencies, TState>(
  state: State<TDependencies, TState>
): ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}> {
  return new ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>(state);
}

export type ModelBuilderCreator<TDependencies> = <TState>(
  state: State<TDependencies, TState>
) => ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>;

export function createModelBuilderCreator<TDependencies>(): ModelBuilderCreator<
  TDependencies
> {
  return createModelBuilder;
}
