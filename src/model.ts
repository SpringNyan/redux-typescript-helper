import { StateFactory } from "./state";
import { Selectors, SelectorCreator, SelectorsFactory } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epics } from "./epic";

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
  state: StateFactory<TState, TDependencies>;
  selectors: SelectorsFactory<
    TSelectors,
    SelectorCreator<TDependencies, TState, any, any>
  >;
  reducers: TReducers;
  effects: TEffects;
  epics: Epics<TDependencies, TState, any, any, any, any>;
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
  private readonly _state: StateFactory<TState, TDependencies>;

  private _selectors: SelectorsFactory<
    Selectors<TDependencies, TState, TSelectors, TModels>,
    SelectorCreator<TDependencies, TState, TSelectors, TModels>
  > = () => ({});

  private _reducers: Reducers<TDependencies, TState> = {};

  private _effects: Effects<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels
  > = {};

  private _epics: Epics<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels
  > = [];

  private _models: Models<TDependencies> = {};

  constructor(state: TState | StateFactory<TState, TDependencies>) {
    this._state = this._toFactoryIfNeeded(state);
  }

  public selectors<
    T extends Selectors<TDependencies, TState, TSelectors, TModels>
  >(
    selectors:
      | T
      | SelectorsFactory<
          T,
          SelectorCreator<TDependencies, TState, TSelectors, TModels>
        >
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors & T,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    const oldSelectors = this._selectors;
    const newSelectors = this._toFactoryIfNeeded(selectors);

    this._selectors = (selectorCreator) => ({
      ...oldSelectors(selectorCreator),
      ...(newSelectors(selectorCreator) as Selectors<
        TDependencies,
        TState,
        TSelectors,
        TModels
      >)
    });

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
    epics: Epics<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels
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
    TDynamicModels & T
  > {
    return this as any;
  }

  public build(
    state?: TState | ((s: TState) => TState)
  ): Model<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    const createState: StateFactory<TState, TDependencies> = (dependencies) => {
      const defaultState = this._state(dependencies);

      return state !== undefined
        ? this._toFactoryIfNeeded(state)(defaultState)
        : defaultState;
    };

    return {
      state: createState,
      selectors: this._selectors,
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

  private _toFactoryIfNeeded<T, U extends any[]>(
    obj: T | ((...args: U) => T)
  ): ((...args: U) => T) {
    return typeof obj === "function" ? obj : () => obj;
  }
}

function createModelBuilder<TDependencies, TState>(
  state: TState | StateFactory<TState, TDependencies>
): ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}> {
  return new ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>(state);
}

export type ModelBuilderCreator<TDependencies> = <TState>(
  state: TState | StateFactory<TState, TDependencies>
) => ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>;

export function createModelBuilderCreator<TDependencies>(): ModelBuilderCreator<
  TDependencies
> {
  return createModelBuilder;
}
