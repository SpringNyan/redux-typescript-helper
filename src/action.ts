import { Reducer } from "./reducer";
import { Epic } from "./epic";

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

export const actionTypes = {
  registerModel: "@@REGISTER_MODEL",
  unregisterModel: "@@UNREGISTER_MODEL"
};
