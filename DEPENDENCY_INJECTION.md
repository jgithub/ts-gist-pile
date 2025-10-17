# Dependency Injection: Container vs Inversify

This document introduces a lightweight DI container (`Container`) inspired by and compatible with [inversify](https://inversify.io/) - one of the best dependency injection libraries for TypeScript.

**The goal is simple:** Provide a smaller footprint to get started with dependency injection, while maintaining compatibility with inversify's published API. When you need more horsepower, upgrade to full inversify with zero breaking changes.

**The philosophy:** Prefer explicit over implied, avoid magic. That's why `Container` uses manual instantiation instead of decorators - your dependencies are visible and your code is clear. At just 2 KB, it's also browser-friendly, making it ideal for client-side projects where bundle size matters.

## Table of Contents

- [Quick Comparison](#quick-comparison)
- [Size and Dependency Comparison](#size-and-dependency-comparison)
- [Built-in Container](#built-in-container)
- [Inversify](#inversify)
- [Service Locator Pattern](#service-locator-pattern)
- [When to Use Which](#when-to-use-which)
- [Migration Guide](#migration-guide)

## Quick Comparison

| Feature | Built-in Container | Inversify |
|---------|-------------------|-----------|
| Philosophy | **Explicit, no magic** | Flexible (explicit or magic) |
| Bundle size | **1.9 KB** | **~1,195 KB (1.17 MB)** |
| Dependencies | **0** | **3-4 packages** |
| Browser-friendly | **Yes** (tiny footprint) | Yes (but larger) |
| Instantiation | Manual (explicit) | Manual or auto-wiring |
| Decorators | Not used | Optional (but common) |
| Auto-wiring | No | Yes (with decorators) |
| Binding scopes | Constant values only | Singleton, Transient, Request |
| Middleware | No | Yes |
| Tagged bindings | No | Yes |
| Contextual bindings | No | Yes |
| Setup complexity | Low | Medium-High |
| TypeScript config | Standard | Requires experimentalDecorators |

## Size and Dependency Comparison

The built-in `Container` provides a much smaller footprint to get started - 2 KB versus 1.4 MB - while maintaining compatibility with inversify's API. Perfect for learning DI patterns, building prototypes, or keeping your bundle size minimal until you need inversify's advanced features.

### Built-in Container

**Source code:**
- File: `src/di/Container.ts`
- Size: 4,773 bytes (4.7 KB)
- Lines of code: 151 lines

**Compiled output:**
- File: `dist/di/Container.js`
- Size: 1,981 bytes (1.9 KB)
- Dependencies: **0** (zero!)

**Total footprint: ~2 KB**

### Inversify

**Package sizes (unpacked):**
- `inversify`: 62,923 bytes (61 KB)
- `@inversifyjs/common`: 24,164 bytes (24 KB)
- `@inversifyjs/container`: 304,554 bytes (297 KB)
- `@inversifyjs/core`: 803,409 bytes (784 KB)
- `reflect-metadata` (peer dependency): 241,158 bytes (235 KB)

**Total footprint: ~1,195 KB (1.17 MB)** without reflect-metadata
**Total footprint: ~1,436 KB (1.40 MB)** with reflect-metadata

### Size Comparison Summary

| Metric | Built-in Container | Inversify (full stack) | Difference |
|--------|-------------------|------------------------|------------|
| Source code | 4.7 KB | N/A | - |
| Compiled code | 1.9 KB | ~1,195 KB | **~604x smaller** |
| With reflect-metadata | N/A | ~1,436 KB | **~726x smaller** |
| Runtime dependencies | 0 | 3-4 packages | 100% fewer |
| Lines of code | 151 | Thousands | Minimal surface area |

### Dependency Trees

**Built-in Container dependency tree:**
```
@jgithub/ts-gist-pile
└── (no DI-specific dependencies)
```

**Inversify dependency tree:**
```
inversify (61 KB)
├── @inversifyjs/common (24 KB)
├── @inversifyjs/container (297 KB)
└── @inversifyjs/core (784 KB)
    └── reflect-metadata (235 KB, peer dependency)
```

### Why a Lightweight Alternative?

The built-in `Container` is roughly **600 times smaller** than the full inversify stack - providing a tiny footprint to get started while maintaining compatibility with inversify's published API.

**Philosophy: Explicit over implied, avoid magic**

`Container` uses manual instantiation instead of decorators because:
- Your dependency graph is visible in code (explicit, not hidden in decorators)
- No magic auto-wiring - you see exactly what's being created and when
- Browser-friendly - no reflection metadata, no decorator overhead
- Works equally well in Node.js and browser environments

**Start with `Container`'s smaller footprint when:**
1. **Client-side/browser apps**: 2 KB vs 1.4 MB matters for page load performance
2. **You prefer explicit code**: Manual instantiation over decorator magic
3. **Library authors**: Don't force 1.4 MB of dependencies on your users
4. **Serverless/Edge functions**: Cold start times benefit from minimal dependencies
5. **Prototyping**: Get DI set up quickly without the overhead

**Upgrade to inversify for more horsepower when:**
- You need middleware, contextual bindings, or tagged bindings
- You want auto-wiring with decorators
- You need multiple binding scopes (transient, singleton, request)
- Your application has grown complex enough to justify the additional features

The upgrade is seamless - just change your import statement and you're using full inversify with zero breaking changes.

### The Compatible API Design

The built-in container intentionally provides the **exact same API** as inversify for manual instantiation:

```typescript
// This code works identically with both containers:
const container = new Container();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
const retrieved = container.get<Logger>(TYPES.Logger);
```

**Migration is literally a one-line change:**
```typescript
// Start with the lightweight Container:
import { Container } from '@jgithub/ts-gist-pile';

// Upgrade to full inversify when you need it:
import { Container } from 'inversify';
```

This design means you can:
- Start with the lightweight version
- Learn inversify's patterns and API
- Switch to full inversify seamlessly when you need advanced features
- Use the same service locator pattern in both

## Built-in Container

The built-in `Container` from `@jgithub/ts-gist-pile` provides a lightweight, type-safe DI container that mirrors inversify's excellent interface design.

**Philosophy:** Prefer explicit over implied, avoid magic. `Container` uses manual instantiation - your dependencies are visible in code, not hidden in decorators. At 2 KB, it's perfect for browser/client-side projects where bundle size matters, while working equally well in Node.js environments.

### Installation

```bash
npm install @jgithub/ts-gist-pile
```

### Key Characteristics

- **Explicit over implicit**: Manual instantiation means your dependency graph is visible in code
- **No magic**: No decorators, no auto-wiring, no hidden behavior - just explicit bindings
- **Browser-friendly**: 2 KB compiled size makes it perfect for client-side applications
- **Constant values only**: Every binding is essentially a singleton (no transient scopes)
- **No decorators**: No need for `experimentalDecorators` in tsconfig.json
- **Minimal API surface**: Just `bind()`, `get()`, `rebind()`, `unbind()`, `unbindAll()`, and `isBound()`
- **Type-safe**: Full TypeScript support with generics

### Basic Usage Example

Works in both Node.js and browser environments. No decorators, no magic - just explicit dependency wiring.

```typescript
import { Container } from '@jgithub/ts-gist-pile';

// 1. Define your service types (strings or symbols)
const TYPES = {
  Logger: 'Logger',
  UserService: 'UserService',
  DatabaseService: 'DatabaseService',
};

// 2. Define interfaces
interface Logger {
  log(message: string): void;
}

interface DatabaseService {
  connect(): Promise<void>;
}

interface UserService {
  getUser(id: string): Promise<User>;
}

// 3. Create implementations
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class PostgresDatabase implements DatabaseService {
  async connect(): Promise<void> {
    console.log('Connected to Postgres');
  }
}

class UserServiceImpl implements UserService {
  constructor(
    private readonly logger: Logger,
    private readonly db: DatabaseService
  ) {}

  async getUser(id: string): Promise<User> {
    this.logger.log(`Getting user ${id}`);
    // ... fetch user from db
  }
}

// 4. Manually wire dependencies (order matters!)
const container = new Container();

// Lower-order services first
const logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

const db = new PostgresDatabase();
container.bind<DatabaseService>(TYPES.DatabaseService).toConstantValue(db);

// Higher-order services that depend on lower-order ones
const userService = new UserServiceImpl(logger, db);
container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

// 5. Retrieve services
const retrievedUserService = container.get<UserService>(TYPES.UserService);
await retrievedUserService.getUser('123');
```

### Real-World Pattern

Here's how the built-in container can be used in a production application:

```typescript
// diTypes.ts - Define all your service identifiers
export const DI_TYPES = {
  DateProviderService: 'DateProviderService',
  SysConfigService: 'SysConfigService',
  PostgresConnectionProviderService: 'PostgresConnectionProviderService',
  UserService: 'UserService',
  AuthService: 'AuthService',
  // ... more types
};

// container.config.ts - Set up your container
import { Container } from '@jgithub/ts-gist-pile';
import DI_TYPES from './diTypes';

console.log('container.config.ts: Starting load...');

const container = new Container();

// ========================================
// Lower-order services (no dependencies)
// ========================================

const dateProviderService: DateProviderService = {
  getNow: () => new Date()
};

const postgresConnectionProviderService =
  new PostgresConnectionProviderServiceImpl();

const sysConfigService: SysConfigService =
  new SysConfigServiceImpl(postgresConnectionProviderService);

// ========================================
// Mid-tier services (depend on lower-order)
// ========================================

const authorizationService: AuthorizationService =
  new AuthorizationServiceImpl();

const whoAmIService: WhoAmIService =
  new WhoAmIServiceImpl(authorizationService, sysConfigService);

const userRepository: UserRepository =
  new UserRepositoryImpl(postgresConnectionProviderService, whoAmIService);

// ========================================
// Higher-order services (depend on mid-tier)
// ========================================

const userService: UserService =
  new UserServiceImpl(userRepository, whoAmIService, authorizationService);

// ========================================
// Bind everything to the container
// ========================================

container.bind<DateProviderService>(DI_TYPES.DateProviderService)
  .toConstantValue(dateProviderService);

container.bind<PostgresConnectionProviderService>(DI_TYPES.PostgresConnectionProviderService)
  .toConstantValue(postgresConnectionProviderService);

container.bind<SysConfigService>(DI_TYPES.SysConfigService)
  .toConstantValue(sysConfigService);

container.bind<AuthorizationService>(DI_TYPES.AuthorizationService)
  .toConstantValue(authorizationService);

container.bind<WhoAmIService>(DI_TYPES.WhoAmIService)
  .toConstantValue(whoAmIService);

container.bind<UserRepository>(DI_TYPES.UserRepository)
  .toConstantValue(userRepository);

container.bind<UserService>(DI_TYPES.UserService)
  .toConstantValue(userService);

console.log('container.config.ts: Load complete.');

export default container;

// ========================================
// Usage in application code
// ========================================

// AppRunner.ts or similar
import container from './container.config';
import DI_TYPES from './diTypes';

export class AppRunner {
  public async run(): Promise<void> {
    // Retrieve services from container
    const dateProviderService =
      container.get<DateProviderService>(DI_TYPES.DateProviderService);

    const userService =
      container.get<UserService>(DI_TYPES.UserService);

    console.log(`Current time: ${dateProviderService.getNow()}`);

    const user = await userService.getUser('123');
    console.log(`User: ${user.name}`);
  }
}
```

### Testing with rebind()

The `rebind()` method is particularly useful for testing:

```typescript
import { expect } from 'chai';
import container from '../src/container.config';
import DI_TYPES from '../src/diTypes';

describe('UserService', () => {
  it('should get user with mocked dependencies', async () => {
    // Create mock logger
    const mockLogger: Logger = {
      log: (message: string) => {
        // Track calls if needed
      }
    };

    // Replace the real logger with mock
    container.rebind<Logger>(DI_TYPES.Logger).toConstantValue(mockLogger);

    // Now get the service that depends on logger
    const userService = container.get<UserService>(DI_TYPES.UserService);

    // Test with mocked dependency
    const user = await userService.getUser('123');
    expect(user).to.exist;
  });
});
```

### Advanced Features

#### Symbol-based service identifiers

For better type safety and to avoid string collisions:

```typescript
const TYPES = {
  Logger: Symbol.for('Logger'),
  UserService: Symbol.for('UserService'),
};

container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
const retrieved = container.get<Logger>(TYPES.Logger);
```

#### Checking if a service is bound

```typescript
if (container.isBound(TYPES.Logger)) {
  const logger = container.get<Logger>(TYPES.Logger);
  logger.log('Logger is available');
}
```

#### Clearing the container

```typescript
// Remove specific binding
container.unbind(TYPES.Logger);

// Remove all bindings
container.unbindAll();
```

## Inversify

Inversify is a powerful IoC container with advanced features like auto-wiring, middleware, and contextual bindings.

### Installation

```bash
npm install inversify reflect-metadata
```

### TypeScript Configuration

Inversify requires additional TypeScript compiler options:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["reflect-metadata"]
  }
}
```

### Basic Usage with Decorators

```typescript
import 'reflect-metadata';
import { Container, injectable, inject } from 'inversify';

const TYPES = {
  Logger: Symbol.for('Logger'),
  UserService: Symbol.for('UserService'),
};

interface Logger {
  log(message: string): void;
}

interface UserService {
  getUser(id: string): string;
}

@injectable()
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

@injectable()
class UserServiceImpl implements UserService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  getUser(id: string): string {
    this.logger.log(`Getting user ${id}`);
    return `User ${id}`;
  }
}

// Container configuration
const container = new Container();
container.bind<Logger>(TYPES.Logger).to(ConsoleLogger);
container.bind<UserService>(TYPES.UserService).to(UserServiceImpl);

// Auto-wiring: inversify creates instances and injects dependencies
const userService = container.get<UserService>(TYPES.UserService);
```

### Inversify WITHOUT Decorators (Manual Instantiation Pattern)

Many projects use inversify **without decorators**, using manual instantiation instead:

```typescript
import { Container } from 'inversify';
import DI_TYPES from './diTypes';

console.log('inversify.config.ts: Starting load...');

const container = new Container();

// ========================================
// Manually instantiate everything
// ========================================

// Lower-order services
const dateProviderService: DateProviderService = {
  getNow: () => new Date()
};

const postgresConnectionProviderService =
  new PostgresConnectionProviderServiceImpl();

const sysConfigService: SysConfigService =
  new SysConfigServiceImpl(postgresConnectionProviderService);

// Mid-tier services
const authorizationService = new AuthorizationServiceImpl();
const whoAmIService = new WhoAmIServiceImpl(authorizationService, sysConfigService);
const userRepository = new UserRepositoryImpl(postgresConnectionProviderService, whoAmIService);

// Higher-order services
const userService = new UserServiceImpl(userRepository, whoAmIService, authorizationService);

// ========================================
// Bind to inversify container
// ========================================

container.bind<DateProviderService>(DI_TYPES.DateProviderService)
  .toConstantValue(dateProviderService);

container.bind<SysConfigService>(DI_TYPES.SysConfigService)
  .toConstantValue(sysConfigService);

container.bind<AuthorizationService>(DI_TYPES.AuthorizationService)
  .toConstantValue(authorizationService);

container.bind<WhoAmIService>(DI_TYPES.WhoAmIService)
  .toConstantValue(whoAmIService);

container.bind<UserRepository>(DI_TYPES.UserRepository)
  .toConstantValue(userRepository);

container.bind<UserService>(DI_TYPES.UserService)
  .toConstantValue(userService);

console.log('inversify.config.ts: Load complete.');

export default container;
```

### Inversify Advanced Features

#### Scoped bindings

```typescript
// Singleton (default): One instance per container
container.bind<Logger>(TYPES.Logger).to(ConsoleLogger).inSingletonScope();

// Transient: New instance every time
container.bind<RequestHandler>(TYPES.RequestHandler).to(RequestHandlerImpl).inTransientScope();
```

#### Tagged bindings

```typescript
container.bind<Logger>(TYPES.Logger).to(FileLogger).whenTargetTagged('output', 'file');
container.bind<Logger>(TYPES.Logger).to(ConsoleLogger).whenTargetTagged('output', 'console');

// Inject with tag
@injectable()
class UserService {
  constructor(
    @inject(TYPES.Logger) @tagged('output', 'file') private fileLogger: Logger,
    @inject(TYPES.Logger) @tagged('output', 'console') private consoleLogger: Logger
  ) {}
}
```

#### Named bindings

```typescript
container.bind<Database>(TYPES.Database).to(PostgresDb).whenTargetNamed('primary');
container.bind<Database>(TYPES.Database).to(MySQLDb).whenTargetNamed('secondary');
```

#### Middleware

```typescript
container.applyMiddleware((planAndResolve) => {
  return (args) => {
    console.log(`Resolving: ${args.serviceIdentifier.toString()}`);
    return planAndResolve(args);
  };
});
```

## Service Locator Pattern

Both the built-in container and inversify support the **service locator pattern**, which is useful for gradually migrating legacy code to DI without refactoring everything at once.

### What is the Service Locator Pattern?

Instead of injecting dependencies through constructors, you export the container instance and use `container.get()` directly in your code to retrieve dependencies. This allows you to use DI in old files that weren't originally set up for dependency injection.

### Using Service Locator with Built-in Container

**Step 1: Export the container from your config file**

```typescript
// src/container.config.ts
import { Container } from '@jgithub/ts-gist-pile';

const TYPES = {
  Logger: 'Logger',
  UserService: 'UserService',
  DatabaseService: 'DatabaseService',
};

const container = new Container();

// Bind all your services
const logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

const dbService = new PostgresDatabase(logger);
container.bind<DatabaseService>(TYPES.DatabaseService).toConstantValue(dbService);

const userService = new UserServiceImpl(logger, dbService);
container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

// Export the container instance
export default container;
export { TYPES };
```

**Step 2: Import and use the container in legacy files**

```typescript
// src/legacy/old-report-generator.ts
// This file was written before we had DI set up
import container, { TYPES } from '../container.config';

export function generateUserReport(userId: string): string {
  // Service locator: get dependencies directly from container
  const logger = container.get<Logger>(TYPES.Logger);
  const userService = container.get<UserService>(TYPES.UserService);

  logger.log(`Generating report for user ${userId}`);

  const user = userService.getUser(userId);
  return `User Report: ${user.name} (${user.email})`;
}

// Another legacy function in the same file
export function cleanupOldUsers(): void {
  const logger = container.get<Logger>(TYPES.Logger);
  const dbService = container.get<DatabaseService>(TYPES.DatabaseService);

  logger.log('Starting user cleanup...');
  dbService.query('DELETE FROM users WHERE last_login < NOW() - INTERVAL 1 YEAR');
}
```

### Using Service Locator with Inversify

The pattern is **identical** with inversify:

**Step 1: Export the container**

```typescript
// src/inversify.config.ts
import { Container } from 'inversify';

const TYPES = {
  Logger: Symbol.for('Logger'),
  UserService: Symbol.for('UserService'),
  DatabaseService: Symbol.for('DatabaseService'),
};

const container = new Container();

// Manual instantiation (no decorators)
const logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

const dbService = new PostgresDatabase(logger);
container.bind<DatabaseService>(TYPES.DatabaseService).toConstantValue(dbService);

const userService = new UserServiceImpl(logger, dbService);
container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

// Export the container instance
export default container;
export { TYPES };
```

**Step 2: Use in legacy files (same code as built-in!)**

```typescript
// src/legacy/old-report-generator.ts
import container, { TYPES } from '../inversify.config';

export function generateUserReport(userId: string): string {
  // Service locator: identical API!
  const logger = container.get<Logger>(TYPES.Logger);
  const userService = container.get<UserService>(TYPES.UserService);

  logger.log(`Generating report for user ${userId}`);

  const user = userService.getUser(userId);
  return `User Report: ${user.name} (${user.email})`;
}
```

### When to Use Service Locator

**Good use cases:**

1. **Legacy code migration**: Gradually adding DI to an existing codebase without massive refactoring
2. **Utility functions**: Standalone functions that need access to services but aren't part of a class
3. **Script files**: One-off scripts or migration scripts that need access to your services
4. **Testing**: Getting services in test files without setting up complex mocks

**Example: Migration script**

```typescript
// scripts/migrate-users.ts
import container, { TYPES } from '../src/container.config';

async function migrateUsers() {
  const logger = container.get<Logger>(TYPES.Logger);
  const dbService = container.get<DatabaseService>(TYPES.DatabaseService);
  const userService = container.get<UserService>(TYPES.UserService);

  logger.log('Starting user migration...');

  const users = await dbService.query('SELECT * FROM legacy_users');
  for (const user of users) {
    await userService.createUser(user);
  }

  logger.log(`Migrated ${users.length} users`);
}

migrateUsers().catch(console.error);
```

### Service Locator vs Constructor Injection

While service locator is convenient, constructor injection is generally preferred for new code:

**Service Locator (legacy/utility code):**
```typescript
export function doSomething() {
  const logger = container.get<Logger>(TYPES.Logger);
  logger.log('Doing something');
}
```

**Constructor Injection (preferred for new code):**
```typescript
export class MyService {
  constructor(private readonly logger: Logger) {}

  doSomething() {
    this.logger.log('Doing something');
  }
}
```

**Why constructor injection is preferred:**
- Dependencies are explicit and visible in the constructor
- Easier to test (just pass mocks to constructor)
- Better for IDEs and type checking
- Makes the dependency graph clearer

**When service locator is acceptable:**
- Migrating legacy code gradually
- Standalone utility functions
- Scripts and one-off tasks
- When refactoring to constructor injection would be too costly

### Key Takeaway

The service locator pattern works **identically** in both the built-in container and inversify:

1. Export your configured container instance
2. Import it in legacy/utility files
3. Use `container.get<T>(TYPES.Something)` to retrieve services

This allows you to gradually adopt DI without having to refactor your entire codebase at once!

## When to Use Which

The built-in `Container` gives you explicit, no-magic DI with a tiny footprint. Perfect for browser/client-side projects, or when you prefer to see your entire dependency graph in plain code. Easy upgrade path to inversify when you need more horsepower.

### Start with Built-in Container When:

1. **You prefer explicit over implicit**: See your entire dependency graph in plain code
2. **You avoid magic**: Manual instantiation over decorator-based auto-wiring
3. **Browser/client-side apps**: 2 KB makes a huge difference for page load performance
4. **Bundle size matters**: Libraries, Edge functions, serverless environments
5. **You're already manually wiring**: If you're not using decorators anyway, why pay for them?
6. **Teaching/onboarding**: Clear, explicit code is easier to understand and debug

### Upgrade to Inversify for More Horsepower When:

1. **Advanced features needed**: Middleware, contextual bindings, tagged bindings
2. **Auto-wiring desired**: Let inversify handle dependency resolution with decorators
3. **Multiple binding scopes**: Transient, singleton, and request-scoped services
4. **Large applications**: Hundreds of services that benefit from advanced organization
5. **Ecosystem compatibility**: Using libraries that integrate with inversify
6. **Team preference**: Your team already knows and loves inversify

### The Migration Path (Recommended Approach)

**Start simple, upgrade when needed:**

```typescript
// Phase 1: Start with the lightweight Container
import { Container } from '@jgithub/ts-gist-pile';
const container = new Container();
// ... build your app with manual DI ...

// Phase 2: When you need more features, one-line change:
import { Container } from 'inversify';
// Everything still works! Now you can add advanced features gradually
```

### Why Not Just Start with Inversify?

You absolutely can! Inversify is fantastic and we love it. But `Container` provides a smaller footprint to get started when:

- **You prefer explicit code**: Manual instantiation means no decorator magic, dependencies are visible
- **Browser/client-side projects**: 2 KB vs 1.4 MB has a real impact on page load times
- **You avoid magic**: No hidden auto-wiring, reflection metadata, or decorator overhead
- **Building a library**: Don't force 1.4 MB of dependencies on your users
- **You're manually instantiating anyway**: Not using decorators? Why include them?

**The key insight:** If you're using inversify with manual instantiation (avoiding decorators), you're getting the same functionality as this lightweight `Container` but with 600x more overhead. Start with a smaller footprint and explicit code, upgrade to inversify when you need more horsepower - the compatible API makes it seamless.

## Migration Guide

### From Inversify (Manual Mode) to Built-in Container

If you're using inversify with manual instantiation, migration is straightforward:

**Before (inversify):**
```typescript
import { Container } from 'inversify';

const container = new Container();
const logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
```

**After (built-in):**
```typescript
import { Container } from '@jgithub/ts-gist-pile';

const container = new Container();
const logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
```

The API is **intentionally compatible** - just change the import!

### From Built-in Container to Inversify

If you start with the built-in container and later need inversify's advanced features:

1. Install inversify: `npm install inversify reflect-metadata`
2. Change import: `import { Container } from 'inversify';`
3. Add `import 'reflect-metadata';` at app entry point
4. Your existing code continues to work unchanged
5. Optionally add decorators and advanced features as needed

### From Inversify (Decorator Mode) to Built-in Container

This requires more work since you need to replace auto-wiring with manual instantiation:

**Before (inversify with decorators):**
```typescript
@injectable()
class UserService {
  constructor(@inject(TYPES.Logger) private logger: Logger) {}
}

container.bind<Logger>(TYPES.Logger).to(ConsoleLogger);
container.bind<UserService>(TYPES.UserService).to(UserService);

const userService = container.get<UserService>(TYPES.UserService);
```

**After (built-in):**
```typescript
class UserService {
  constructor(private logger: Logger) {}
}

const logger = new ConsoleLogger();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

const userService = new UserService(logger);
container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

const retrieved = container.get<UserService>(TYPES.UserService);
```

## Conclusion

The built-in `Container` is inspired by inversify's excellent design, providing a smaller footprint to get started while maintaining compatibility with inversify's published API.

**The philosophy: Explicit over implied, avoid magic**

- **Explicit dependencies**: Your dependency graph is visible in code, not hidden in decorators
- **No magic**: Manual instantiation means you control exactly what gets created and when
- **Browser-friendly**: At 2 KB, works perfectly in client-side applications
- **Node.js friendly**: Works equally well in server-side applications
- **Clear upgrade path**: Compatible API means switching to inversify is a one-line change

**We love inversify.** This isn't about replacing it - it's about having a lightweight, explicit alternative to get started. The API compatibility ensures you're learning inversify's patterns from day one. When you need more power (middleware, auto-wiring, contextual bindings), you're already using the right API.

**Your path:**
1. **Container** (2 KB): Start with explicit manual instantiation, browser-friendly, no magic
2. **Upgrade to Inversify** (1.4 MB): Change import, unlock middleware, decorators, auto-wiring, contextual bindings

Start small and explicit, upgrade when you need horsepower. The compatible API makes it seamless.

## Real-World Example: API Compatibility

This example shows how `Container` and inversify are intentionally designed to be **100% API compatible** for manual instantiation patterns, making the switch between them a non-breaking change.

### Built-in Container

```typescript
// src/di/container.config.ts
import { Container } from '@jgithub/ts-gist-pile';
import { TYPES } from './types';

const container = new Container();

// Manual instantiation in dependency order
const dateService = new DateServiceImpl();
const configService = new ConfigServiceImpl(dateService);
const dbService = new DatabaseServiceImpl(configService);
const userRepo = new UserRepositoryImpl(dbService);
const authService = new AuthServiceImpl(userRepo, configService);
const userController = new UserController(authService, userRepo);

// Bind to container
container.bind(TYPES.DateService).toConstantValue(dateService);
container.bind(TYPES.ConfigService).toConstantValue(configService);
container.bind(TYPES.DatabaseService).toConstantValue(dbService);
container.bind(TYPES.UserRepository).toConstantValue(userRepo);
container.bind(TYPES.AuthService).toConstantValue(authService);
container.bind(TYPES.UserController).toConstantValue(userController);

export default container;
```

### Inversify Manual Mode (Manual Instantiation Pattern)

```typescript
// src/inversify.config.ts
import { Container } from 'inversify';
import DI_TYPES from './diTypes';

console.log('inversify.config.ts: Starting load...');
const container = new Container();

// Manual instantiation in dependency order (IDENTICAL to built-in container)
const dateService = new DateServiceImpl();
const configService = new ConfigServiceImpl(dateService);
const dbService = new DatabaseServiceImpl(configService);
const userRepo = new UserRepositoryImpl(dbService);
const authService = new AuthServiceImpl(userRepo, configService);
const userController = new UserController(authService, userRepo);

// Bind to inversify container (IDENTICAL API)
container.bind(DI_TYPES.DateService).toConstantValue(dateService);
container.bind(DI_TYPES.ConfigService).toConstantValue(configService);
container.bind(DI_TYPES.DatabaseService).toConstantValue(dbService);
container.bind(DI_TYPES.UserRepository).toConstantValue(userRepo);
container.bind(DI_TYPES.AuthService).toConstantValue(authService);
container.bind(DI_TYPES.UserController).toConstantValue(userController);

console.log('inversify.config.ts: Load complete.');
export default container;
```

**The code is intentionally identical!** `Container` mirrors inversify's excellent interface design for manual instantiation patterns. This means switching from `Container` to inversify is a **non-breaking change** - just update your import statement. Start with 2 KB, upgrade to full inversify when you need it - your code doesn't change.
