import { ResultTuple } from "../result/ResultTuple";
export declare function tryCatchTuplify<T, E = Error>(fn: () => T): ResultTuple<T, E>;
export declare function tryCatchTuplifyAsync<T, E = Error>(promise: Promise<T>): Promise<ResultTuple<T, E>>;
