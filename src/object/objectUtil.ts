import { cloneDeep as _theImplementation } from "lodash";

export function cloneDeep<T>(obj: T): T {
  return _theImplementation(obj);
}