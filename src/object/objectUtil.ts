import { cloneDeep as _theImplementation } from "lodash";

// This was moved to cloneUtil
// export function cloneDeep<T>(obj: T): T {
//   return _theImplementation(obj);
// }


export function isPresent(input: object | undefined | null): boolean {
  if (typeof input === 'undefined' || input === null) {
    return false;
  }
  return true;
}

export const exists = isPresent;
