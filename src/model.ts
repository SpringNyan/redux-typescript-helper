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
  TDynamicModel extends Model<TDependencies> | never = never
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

export type ExtractDynamicModel<
  TModel extends Model<any, any, any, any, any, any, any>
> = TModel extends Model<any, any, any, any, any, any, infer TDynamicModel>
  ? TDynamicModel
  : never;

export class ModelFactory<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState, any, any>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any, any, any>,
  TModels extends Models<TDependencies>,
  TDynamicModel extends Model<TDependencies> | never
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

  public dynamicModel<
    T extends Model<TDependencies> = Model<
      TDependencies,
      unknown,
      {},
      {},
      {},
      {},
      never
    >
  >(): ModelFactory<
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
  ): ModelFactory<
    TDependencies,
    TState,
    TSelectors & T,
    TReducers,
    TEffects,
    TModels,
    TDynamicModel
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
  ): ModelFactory<
    TDependencies,
    TState,
    TSelectors,
    TReducers & T,
    TEffects,
    TModels,
    TDynamicModel
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
  ): ModelFactory<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects & T,
    TModels,
    TDynamicModel
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
  ): ModelFactory<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModel
  > {
    this._epics = [...this._epics, ...epics];

    return this as any;
  }

  public models<T extends Models<TDependencies>>(
    models: T
  ): ModelFactory<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels & T,
    TDynamicModel
  > {
    this._models = {
      ...this._models,
      ...(models as Models<TDependencies>)
    };

    return this as any;
  }

  public create(): Model<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModel
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
      TDynamicModel
    >;
  }
}

function createModelFactory<TDependencies, TState>(
  state: State<TDependencies, TState>
): ModelFactory<TDependencies, TState, {}, {}, {}, {}, never> {
  return new ModelFactory<TDependencies, TState, {}, {}, {}, {}, never>(state);
}

export type ModelFactoryCreator<TDependencies> = <TState>(
  state: State<TDependencies, TState>
) => ModelFactory<TDependencies, TState, {}, {}, {}, {}, never>;

export function createModelFactoryCreator<TDependencies>(): ModelFactoryCreator<
  TDependencies
> {
  return createModelFactory;
}
