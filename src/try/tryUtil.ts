import { ResultTuple } from "../result/ResultTuple";

export function tryCatchTuplify<T, E = Error>(fn: () => T): ResultTuple<T, E> {
  try {
    return [fn(), null];
  } catch (error) {
    return [null, error as E];
  }
}

export async function tryCatchTuplifyAsync<T, E = Error>(promise: Promise<T>): Promise<ResultTuple<T, E>> {
  try {
    return [await promise, null];
  } catch (error) {
    return [null, error as E];
  }
}
