export declare class Container {
    private readonly bindings;
    bind<T>(serviceIdentifier: string | symbol): ConstantServiceBinder<T>;
    rebind<T>(serviceIdentifier: string | symbol): ConstantServiceBinder<T>;
    get<T>(serviceIdentifier: string | symbol): T;
    isBound(serviceIdentifier: string | symbol): boolean;
    unbind(serviceIdentifier: string | symbol): boolean;
    unbindAll(): void;
    get size(): number;
}
declare class ConstantServiceBinder<T> {
    private readonly bindings;
    private readonly serviceIdentifier;
    constructor(bindings: Map<string | symbol, unknown>, serviceIdentifier: string | symbol);
    toConstantValue(value: T): void;
}
export {};
