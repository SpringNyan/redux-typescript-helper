import { StateFactory } from "./state";
import { Selectors, SelectorCreator, SelectorsFactory } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epics } from "./epic";

export interface Model<
  TDependencies = any,
  TState = any,
  TSelectors extends Selectors<TDependencies, TState> = Selectors<
    TDependencies,
    TState
  >,
  TReducers extends Reducers<TDependencies, TState> = Reducers<
    TDependencies,
    TState
  >,
  TEffects extends Effects<TDependencies, TState> = Effects<
    TDependencies,
    TState
  >,
  TModels extends Models<TDependencies> = Models<TDependencies>,
  TDynamicModels extends Models<TDependencies> = Models<TDependencies>
> {
  state: StateFactory<TState, TDependencies>;
  selectors: SelectorsFactory<
    TSelectors,
    SelectorCreator<TDependencies, TState>
  >;
  reducers: TReducers;
  effects: TEffects;
  epics: Epics<TDependencies, TState>;
  models: TModels;
}

export type Models<TDependencies = any> = {
  [key: string]: Model<TDependencies>;
};

export type ExtractDynamicModels<T extends Model> = T extends Model<
  any,
  any,
  any,
  any,
  any,
  any,
  infer TDynamicModels
>
  ? TDynamicModels
  : never;

export class ModelBuilder<
  TDependencies,
  TState,
  TSelectors extends Selectors<TDependencies, TState>,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState>,
  TModels extends Models<TDependencies>,
  TDynamicModels extends Models<TDependencies>
> {
  private readonly _model: Model;

  constructor(
    model: Model<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >
  ) {
    this._model = cloneModel(model);
  }

  public state(
    state: TState | ((s: TState) => TState)
  ): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    const oldState = this._model.state;
    const newState = toFactoryIfNeeded(state);

    this._model.state = (dependencies) => newState(oldState(dependencies));

    return this as any;
  }

  public selectors<
    T extends Selectors<
      TDependencies,
      TState,
      TSelectors,
      TModels,
      TDynamicModels
    >
  >(
    selectors:
      | T
      | SelectorsFactory<
          T,
          SelectorCreator<
            TDependencies,
            TState,
            TSelectors,
            TModels,
            TDynamicModels
          >
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
    const oldSelectors = this._model.selectors;
    const newSelectors = toFactoryIfNeeded(selectors);

    this._model.selectors = (selectorCreator) => ({
      ...oldSelectors(selectorCreator),
      ...(newSelectors(selectorCreator) as Selectors<
        TDependencies,
        TState,
        TSelectors,
        TModels,
        TDynamicModels
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
    this._model.reducers = {
      ...this._model.reducers,
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
      TModels,
      TDynamicModels
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
    this._model.effects = {
      ...this._model.effects,
      ...(effects as Effects<
        TDependencies,
        TState,
        TSelectors,
        TReducers,
        TEffects,
        TModels,
        TDynamicModels
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
      TModels,
      TDynamicModels
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
    this._model.epics = [...this._model.epics, ...epics];

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
    this._model.models = {
      ...this._model.models,
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

  public build(): Model<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    return cloneModel(this._model) as Model<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >;
  }

  public clone(): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    return new ModelBuilder(this._model as Model<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
      TModels,
      TDynamicModels
    >);
  }
}

function toFactoryIfNeeded<T, U extends any[]>(
  obj: T | ((...args: U) => T)
): ((...args: U) => T) {
  return typeof obj === "function" ? obj : () => obj;
}

function createModel<TDependencies, TState>(
  state: TState | StateFactory<TState, TDependencies>
): Model<TDependencies, TState, {}, {}, {}, {}, {}> {
  return {
    state: toFactoryIfNeeded(state),
    selectors: () => ({}),
    reducers: {},
    effects: {},
    epics: [],
    models: {}
  };
}

function createModelBuilder<TDependencies, TState>(
  state: TState | StateFactory<TState, TDependencies>
): ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}> {
  return new ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>(
    createModel(state)
  );
}

export type ModelBuilderCreator<TDependencies> = <TState>(
  state: TState | StateFactory<TState, TDependencies>
) => ModelBuilder<TDependencies, TState, {}, {}, {}, {}, {}>;

export function createModelBuilderCreator<TDependencies>(): ModelBuilderCreator<
  TDependencies
> {
  return createModelBuilder;
}

export function cloneModel<TModel extends Model>(model: TModel): TModel {
  return {
    state: model.state,
    selectors: model.selectors,
    reducers: { ...model.reducers },
    effects: { ...model.effects },
    epics: [...model.epics],
    models: { ...model.models }
  } as TModel;
}
