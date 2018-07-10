import { Reducer, Reducers } from "./reducer";
import { Epic, Epics } from "./epic";

export interface Action<TPayload> {
  type: string;
  payload: TPayload;
}

export type ExtractActionPayload<
  T extends Reducer<any, any, any> | Epic<any, any, any, any, any>
> = T extends
  | Reducer<any, any, infer TPayload>
  | Epic<any, any, any, any, infer TPayload>
  ? TPayload
  : never;

export type Dispatch<
  T extends Reducers<any, any> | Epics<any, any, any, any>
> = {
  [K in keyof T]: ((
    payload: ExtractActionPayload<T[K]>
  ) => Action<ExtractActionPayload<T[K]>>) & { type: string }
};
