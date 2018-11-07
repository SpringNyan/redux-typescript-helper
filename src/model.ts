import { StateFactory } from "./state";
import { Selectors, SelectorCreator, SelectorsFactory } from "./selector";
import { Reducers } from "./reducer";
import { Effects, Epics } from "./epic";
import { StoreHelper } from "./store";

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

export type ExtractModel<
  T extends ModelBuilder<any, any, any, any, any, any, any> | StoreHelper<any>
> = T extends ModelBuilder<any, any, any, any, any, any, any>
  ? ReturnType<T["build"]>
  : T extends StoreHelper<infer TModel> ? TModel : never;

export type ExtractModels<T extends Model> = T extends Model<
  any,
  any,
  any,
  any,
  any,
  infer TModels,
  any
>
  ? TModels
  : never;

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
  TSelectors extends Selectors,
  TReducers extends Reducers,
  TEffects extends Effects,
  TModels extends Models,
  TDynamicModels extends Models
> {
  private readonly _model: Model;
  private _isFrozen: boolean = false;

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

  public dependencies<T>(): ModelBuilder<
    TDependencies & T,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    if (this._isFrozen) {
      return this.clone().dependencies<T>();
    }

    return this as any;
  }

  public state<T>(
    state: T | StateFactory<T, TDependencies>
  ): ModelBuilder<
    TDependencies,
    TState & T,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    if (this._isFrozen) {
      return this.clone().state(state);
    }

    const oldState: StateFactory = this._model.state;
    const newState: StateFactory = toFactoryIfNeeded(state);

    this._model.state =
      oldState == null
        ? newState
        : (dependencies) => ({
            ...oldState(dependencies),
            ...newState(dependencies)
          });

    return this as any;
  }

  public selectors<
    T extends Selectors<
      TDependencies,
      TState,
      TSelectors,
      TReducers,
      TEffects,
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
            TReducers,
            TEffects,
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
    if (this._isFrozen) {
      return this.clone().selectors(selectors);
    }

    const oldSelectors: SelectorsFactory = this._model.selectors;
    const newSelectors: SelectorsFactory = toFactoryIfNeeded(selectors);

    this._model.selectors = (selectorCreator) => ({
      ...oldSelectors(selectorCreator),
      ...newSelectors(selectorCreator)
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
    if (this._isFrozen) {
      return this.clone().reducers(reducers);
    }

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
    if (this._isFrozen) {
      return this.clone().effects(effects);
    }

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
    if (this._isFrozen) {
      return this.clone().epics(epics);
    }

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
    if (this._isFrozen) {
      return this.clone().models(models);
    }

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
    if (this._isFrozen) {
      return this.clone().dynamicModels<T>();
    }

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
    if (this._model.state == null) {
      throw new Error("state is not defined");
    }

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

  public freeze(): ModelBuilder<
    TDependencies,
    TState,
    TSelectors,
    TReducers,
    TEffects,
    TModels,
    TDynamicModels
  > {
    this._isFrozen = true;
    return this;
  }
}

function toFactoryIfNeeded<T, U extends any[]>(
  obj: T | ((...args: U) => T)
): ((...args: U) => T) {
  return typeof obj === "function" ? (obj as (...args: U) => T) : () => obj;
}

export function createModelBuilder(): ModelBuilder<
  unknown,
  unknown,
  {},
  {},
  {},
  {},
  {}
> {
  return new ModelBuilder<unknown, unknown, {}, {}, {}, {}, {}>({
    state: undefined!,
    selectors: () => ({}),
    reducers: {},
    effects: {},
    epics: [],
    models: {}
  });
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
