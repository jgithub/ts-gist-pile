# Lightweight Dependency Injection Container

A simple, type-safe dependency injection container that provides an inversify-like interface without the complexity.

## Key Features

- **No decorators required** - Manual instantiation keeps it simple
- **Type-safe** - Full TypeScript support with generics
- **Minimal overhead** - Just a thin wrapper around a Map
- **Familiar API** - Compatible with inversify's `bind()` and `get()` pattern
- **Zero dependencies** - No external packages required

## Why Use This Instead of Inversify?

Inversify is a powerful DI framework, but it's often overkill for simpler use cases. Use this container when:

- You don't need decorator-based injection (`@injectable`, `@inject`)
- You're manually constructing your dependencies anyway
- You want minimal bundle size and overhead
- You only need constant value bindings (no transient/singleton scopes)
- You want a simple service locator pattern

## Basic Usage

```typescript
import { Container } from '@jgithub/ts-gist-pile';

// 1. Define service identifiers (like inversify's TYPES)
const TYPES = {
  Logger: 'Logger',
  DatabaseService: 'DatabaseService',
  UserService: 'UserService',
};

// 2. Create interfaces for your services
interface Logger {
  log(message: string): void;
}

interface DatabaseService {
  query(sql: string): Promise<any>;
}

interface UserService {
  getUser(id: string): Promise<User>;
}

// 3. Create the container
const container = new Container();

// 4. Manually instantiate and bind services in dependency order
const logger: Logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

const db: DatabaseService = new PostgresService(logger);
container.bind<DatabaseService>(TYPES.DatabaseService).toConstantValue(db);

const userService: UserService = new UserServiceImpl(db, logger);
container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

// 5. Retrieve services anywhere in your app
const retrievedUserService = container.get<UserService>(TYPES.UserService);
const user = await retrievedUserService.getUser('123');
```

## API Reference

### `bind<T>(serviceIdentifier: string | symbol)`

Bind a service identifier to a value. Returns a binding interface.

```typescript
container.bind<MyService>(TYPES.MyService).toConstantValue(myServiceInstance);
```

### `get<T>(serviceIdentifier: string | symbol): T`

Retrieve a service instance by its identifier.

```typescript
const service = container.get<MyService>(TYPES.MyService);
```

Throws an error if no binding exists for the identifier.

### `rebind<T>(serviceIdentifier: string | symbol)`

Replace an existing binding or create a new one. Useful for testing with mocks.

```typescript
// Original
container.bind<Logger>(TYPES.Logger).toConstantValue(realLogger);

// Replace with mock for testing
container.rebind<Logger>(TYPES.Logger).toConstantValue(mockLogger);
```

### `isBound(serviceIdentifier: string | symbol): boolean`

Check if a binding exists.

```typescript
if (container.isBound(TYPES.Logger)) {
  const logger = container.get<Logger>(TYPES.Logger);
}
```

### `unbind(serviceIdentifier: string | symbol): boolean`

Remove a binding. Returns `true` if the binding was removed, `false` if it didn't exist.

```typescript
container.unbind(TYPES.Logger);
```

### `unbindAll(): void`

Remove all bindings from the container.

```typescript
container.unbindAll();
```

### `size: number`

Get the number of bindings in the container.

```typescript
console.log(`Container has ${container.size} bindings`);
```

## Using Symbols as Service Identifiers

You can use JavaScript Symbols instead of strings for service identifiers to avoid naming conflicts:

```typescript
const TYPES = {
  Logger: Symbol('Logger'),
  UserService: Symbol('UserService'),
};

container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
const retrievedLogger = container.get<Logger>(TYPES.Logger);
```

## Testing with Mocks

Use `rebind()` to replace real services with mocks in tests:

```typescript
// Production code
const container = new Container();
container.bind<EmailService>(TYPES.EmailService).toConstantValue(realEmailService);

// Test code
const mockEmailService: EmailService = {
  send: jest.fn(),
};
container.rebind<EmailService>(TYPES.EmailService).toConstantValue(mockEmailService);
```

## Comparison with Inversify

| Feature | This Container | Inversify |
|---------|---------------|-----------|
| Manual instantiation | ✅ Yes | Optional |
| Decorator-based injection | ❌ No | ✅ Yes |
| Constant value bindings | ✅ Yes | ✅ Yes |
| Transient/Singleton scopes | ❌ No | ✅ Yes |
| Factory bindings | ❌ No | ✅ Yes |
| Auto-injection | ❌ No | ✅ Yes |
| Bundle size | ~1KB | ~50KB |
| Dependencies | Zero | Several |

## Pattern Example: Relito-style Configuration

This container is designed to work exactly like inversify is used in the relito project:

```typescript
// diTypes.ts
const DI_TYPES = {
  DateProviderService: 'DateProviderService',
  UserRepository: 'UserRepository',
  UserController: 'UserController',
};

// inversify.config.ts (or container.config.ts)
const container = new Container();

// Manually construct in dependency order
const dateProviderService: DateProviderService = {
  getNow: () => new Date()
};

const userRepository: UserRepository = new UserRepositoryImpl(dateProviderService);
const userController = new UserController(userRepository);

// Bind to container
container.bind<DateProviderService>(DI_TYPES.DateProviderService).toConstantValue(dateProviderService);
container.bind<UserRepository>(DI_TYPES.UserRepository).toConstantValue(userRepository);
container.bind<UserController>(DI_TYPES.UserController).toConstantValue(userController);

export default container;

// app.ts
import container from './container.config';
import DI_TYPES from './diTypes';

const userController = container.get<UserController>(DI_TYPES.UserController);
```

## License

Part of ts-gist-pile
