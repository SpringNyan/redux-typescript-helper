import { State } from "./state";
import { Reducers } from "./reducer";
import { Epics } from "./epic";

export interface Model<
  TDependencies = any,
  TState = any,
  TReducers extends Reducers<TDependencies, TState> = Reducers<
    TDependencies,
    TState
  >,
  TEpics extends Epics<TDependencies, TState, TReducers, TEpics> = Epics<
    TDependencies,
    TState,
    TReducers,
    TEpics
  >,
  TModels extends Models<TDependencies> = Models<TDependencies>
> {
  state: State<TDependencies, TState>;
  reducers: TReducers;
  epics: TEpics;
  models: TModels;
}

export type Models<TDependencies> = {
  [key: string]: Model<TDependencies>;
};

export class ModelFactory<
  TDependencies,
  TState,
  TReducers extends Reducers<TDependencies, TState>,
  TEpics extends Epics<TDependencies, TState, any, any>,
  TModels extends Models<TDependencies>
> {
  private readonly _state: State<TDependencies, TState>;
  private _reducers: Reducers<TDependencies, TState> = {};
  private _epics: Epics<TDependencies, TState, TReducers, TEpics> = {};
  private _models: Models<TDependencies> = {};

  constructor(state: State<TDependencies, TState>) {
    this._state = state;
  }

  public reducers<T extends Reducers<TDependencies, TState>>(
    reducers: T
  ): ModelFactory<TDependencies, TState, TReducers & T, TEpics, TModels> {
    this._reducers = {
      ...this._reducers,
      ...(reducers as Reducers<TDependencies, TState>)
    };

    return this as any;
  }

  public epics<T extends Epics<TDependencies, TState, TReducers, TEpics>>(
    epics: T
  ): ModelFactory<TDependencies, TState, TReducers, TEpics & T, TModels> {
    this._epics = {
      ...this._epics,
      ...(epics as Epics<TDependencies, TState, TReducers, TEpics>)
    };

    return this as any;
  }

  public models<T extends Models<TDependencies>>(
    models: T
  ): ModelFactory<TDependencies, TState, TReducers, TEpics, TModels & T> {
    this._models = {
      ...this._models,
      ...(models as Models<TDependencies>)
    };

    return this as any;
  }

  public create(): Model<TDependencies, TState, TReducers, TEpics, TModels> {
    return {
      state: this._state,
      reducers: { ...this._reducers },
      epics: { ...this._epics },
      models: { ...this._models }
    } as any;
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
    epics: { ...model.epics },
    models: { ...model.models }
  } as any;
}
