import { State } from "./state";
import { Reducers } from "./reducer";
import { Effects } from "./effect";

export interface Model<
  TDependencies = any,
  TState = any,
  TReducers extends Reducers<TDependencies, TState> = Reducers<
    TDependencies,
    TState
  >,
  TEffects extends Effects<
    TDependencies,
    TState,
    TReducers,
    TEffects
  > = Effects<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies> = Models<TDependencies>
> {
  state: State<TDependencies, TState>;
  reducers: TReducers;
  effects: TEffects;
  models: TModels;
}

export type Models<TDependencies> = {
  [key: string]: Model<TDependencies>;
};

export class ModelFactory<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEffects extends Effects<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies>
> {
  private readonly _state: State<TDependencies, TState>;
  private _reducers: Reducers<TDependencies, TState> = {};
  private _effects: Effects<TDependencies, TState, TReducers, TEffects> = {};
  private _models: Models<TDependencies> = {};

  constructor(state: State<TDependencies, TState>) {
    this._state = state;
  }

  public reducers<T extends Reducers<TDependencies, TState>>(
    reducers: T
  ): ModelFactory<TDependencies, TState, TReducers & T, TEffects, TModels> {
    this._reducers = {
      ...this._reducers,
      ...(reducers as Reducers<TDependencies, TState>)
    };

    return this as any;
  }

  public effects<T extends Effects<TDependencies, TState, TReducers, TEffects>>(
    effects: T
  ): ModelFactory<TDependencies, TState, TReducers, TEffects & T, TModels> {
    this._effects = {
      ...this._effects,
      ...(effects as Effects<TDependencies, TState, TReducers, TEffects>)
    };

    return this as any;
  }

  public models<T extends Models<TDependencies>>(
    models: T
  ): ModelFactory<TDependencies, TState, TReducers, TEffects, TModels & T> {
    this._models = {
      ...this._models,
      ...(models as Models<TDependencies>)
    };

    return this as any;
  }

  public create(): Model<TDependencies, TState, TReducers, TEffects, TModels> {
    return {
      state: this._state,
      reducers: { ...this._reducers },
      effects: { ...this._effects },
      models: { ...this._models }
    } as Model<TDependencies, TState, TReducers, TEffects, TModels>;
  }
}

function createModelFactory<TDependencies, TState>(
  state: TState
): ModelFactory<TDependencies, TState, {}, {}, {}> {
  return new ModelFactory<TDependencies, TState, {}, {}, {}>(state);
}

export type ModelFactoryCreator<TDependencies> = <TState>(
  state: TState
) => ModelFactory<TDependencies, TState, {}, {}, {}>;

export function createModelFactoryCreator<TDependencies>(): ModelFactoryCreator<
  TDependencies
> {
  return createModelFactory;
}

export function cloneModel<TModel extends Model>(model: TModel): TModel {
  return {
    state: model.state,
    reducers: { ...model.reducers },
    effects: { ...model.effects },
    models: { ...model.models }
  } as TModel;
}
