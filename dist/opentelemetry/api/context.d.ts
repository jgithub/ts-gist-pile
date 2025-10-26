export interface Context {
    getValue(key: symbol): unknown;
    setValue(key: symbol, value: unknown): Context;
    deleteValue(key: symbol): Context;
}
export interface ContextAPI {
    active(): Context;
    with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(context: Context, fn: F, thisArg?: ThisParameterType<F>, ...args: A): ReturnType<F>;
    bind<T>(context: Context, target: T): T;
    disable(): void;
    createKey(description: string): symbol;
}
export declare const context: ContextAPI;
