/**
 * Lightweight dependency injection container
 *
 * Provides a simple, type-safe alternative to inversify for registering
 * and retrieving service instances. Unlike inversify, this container:
 * - Requires manual instantiation (no decorators)
 * - Only supports constant value bindings (no transient/singleton scopes)
 * - Has minimal overhead and dependencies
 *
 * @example
 * ```typescript
 * import { Container } from '@jgithub/ts-gist-pile';
 *
 * const TYPES = {
 *   UserService: 'UserService',
 *   Logger: 'Logger'
 * };
 *
 * const container = new Container();
 *
 * // Register services
 * const logger = new ConsoleLogger();
 * container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
 *
 * const userService = new UserServiceImpl(logger);
 * container.bind<UserService>(TYPES.UserService).toConstantValue(userService);
 *
 * // Retrieve services
 * const retrievedService = container.get<UserService>(TYPES.UserService);
 * ```
 */
export class Container {
  private readonly bindings: Map<string | symbol, unknown> = new Map();

  /**
   * Bind a service identifier to a value
   *
   * @param serviceIdentifier - A string or symbol that uniquely identifies the service
   * @returns A binding interface that allows you to specify the value
   *
   * @example
   * ```typescript
   * container.bind<MyService>(TYPES.MyService).toConstantValue(myServiceInstance);
   * ```
   */
  public bind<T>(serviceIdentifier: string | symbol): ConstantServiceBinder<T> {
    return new ConstantServiceBinder<T>(this.bindings, serviceIdentifier);
  }

  /**
   * Rebind a service identifier to a new value
   *
   * This is useful for replacing an existing binding (e.g., for testing) or creating
   * a new binding if one doesn't exist. It's functionally equivalent to unbind + bind.
   *
   * @param serviceIdentifier - A string or symbol that uniquely identifies the service
   * @returns A binding interface that allows you to specify the value
   *
   * @example
   * ```typescript
   * // Replace an existing service with a mock for testing
   * container.rebind<MyService>(TYPES.MyService).toConstantValue(mockServiceInstance);
   * ```
   */
  public rebind<T>(serviceIdentifier: string | symbol): ConstantServiceBinder<T> {
    this.unbind(serviceIdentifier); // Remove existing binding if it exists
    return new ConstantServiceBinder<T>(this.bindings, serviceIdentifier);
  }

  /**
   * Retrieve a service instance by its identifier
   *
   * @param serviceIdentifier - The string or symbol that identifies the service
   * @returns The service instance
   * @throws {Error} If no binding exists for the given identifier
   *
   * @example
   * ```typescript
   * const service = container.get<MyService>(TYPES.MyService);
   * ```
   */
  public get<T>(serviceIdentifier: string | symbol): T {
    if (!this.bindings.has(serviceIdentifier)) {
      const identifierStr = typeof serviceIdentifier === 'symbol'
        ? serviceIdentifier.toString()
        : serviceIdentifier;
      throw new Error(`No binding found for service identifier: ${identifierStr}`);
    }
    return this.bindings.get(serviceIdentifier) as T;
  }

  /**
   * Check if a binding exists for the given service identifier
   *
   * @param serviceIdentifier - The string or symbol that identifies the service
   * @returns true if a binding exists, false otherwise
   */
  public isBound(serviceIdentifier: string | symbol): boolean {
    return this.bindings.has(serviceIdentifier);
  }

  /**
   * Remove a binding for the given service identifier
   *
   * @param serviceIdentifier - The string or symbol that identifies the service
   * @returns true if the binding was removed, false if it didn't exist
   */
  public unbind(serviceIdentifier: string | symbol): boolean {
    return this.bindings.delete(serviceIdentifier);
  }

  /**
   * Remove all bindings from the container
   */
  public unbindAll(): void {
    this.bindings.clear();
  }

  /**
   * Get the number of bindings in the container
   */
  public get size(): number {
    return this.bindings.size;
  }
}

/**
 * Fluent interface for binding a constant value to a service identifier
 * This mimics the inversify API: container.bind<T>(key).toConstantValue(value)
 */
class ConstantServiceBinder<T> {
  constructor(
    private readonly bindings: Map<string | symbol, unknown>,
    private readonly serviceIdentifier: string | symbol
  ) {}

  /**
   * Bind the service identifier to a constant value
   *
   * @param value - The instance to bind
   * @returns void
   *
   * @example
   * ```typescript
   * container.bind<Logger>(TYPES.Logger).toConstantValue(new ConsoleLogger());
   * ```
   */
  public toConstantValue(value: T): void {
    this.bindings.set(this.serviceIdentifier, value);
  }
}
