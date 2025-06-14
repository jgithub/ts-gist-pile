import { cloneDeep as _theImplementation } from "lodash";

export function cloneWithOverrides<T>(original: T, overrides: Partial<T>): T {
  const result = { ..._theImplementation(original), ...overrides };
  return result as T;
}

export function cloneDeep<T>(obj: T): T {
  return _theImplementation(obj);
}