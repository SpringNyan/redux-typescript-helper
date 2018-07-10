import { Reducers } from "./reducer";
import { Epics } from "./epic";

export type ModelState<TDependencies, TState> =
  | TState
  | ((dependencies: TDependencies) => TState);

export type ExtractModelState<
  TModel extends Model<any, any, any, any, any>
> = TModel extends Model<any, infer TState, any, any, any> ? TState : never;

export interface Model<
  TDependencies,
  TState,
  TReducers extends Reducers<TState, TDependencies>,
  TEpics extends Epics<TState, TDependencies, TReducers, TEpics>,
  TModels extends Models<TDependencies>
> {
  state: ModelState<TDependencies, TState>;
  reducers: TReducers;
  epics: TEpics;
  models: TModels;
}

export type Models<TDependencies> = {
  [key: string]: Model<TDependencies, any, any, any, any>;
};

export class ModelFactory<
  TDependencies,
  TState,
  TReducers extends Reducers<TState, TDependencies>,
  TEpics extends Epics<TState, TDependencies, TReducers, TEpics>,
  TModels extends Models<TDependencies>
> {
  private readonly _state: ModelState<TDependencies, TState>;
  private _reducers: Reducers<TState, TDependencies> = {};
  private _epics: Epics<TState, TDependencies, TReducers, TEpics> = {};
  private _models: Models<TDependencies> = {};

  constructor(state: ModelState<TDependencies, TState>) {
    this._state = state;
  }

  public reducers<T extends Reducers<TState, TDependencies>>(
    reducers: T
  ): ModelFactory<TDependencies, TState, TReducers & T, TEpics, TModels> {
    this._reducers = {
      ...this._reducers,
      ...(reducers as Reducers<TState, TDependencies>)
    };

    return this as any;
  }

  public epics<T extends Epics<TState, TDependencies, TReducers, TEpics>>(
    epics: T
  ): ModelFactory<TDependencies, TState, TReducers, TEpics & T, TModels> {
    this._epics = {
      ...this._epics,
      ...(epics as Epics<TState, TDependencies, TReducers, TEpics>)
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
