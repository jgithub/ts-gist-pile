# ts-gist-pile Development History
## October 2023 - October 2025

*2-year evolution of a foundational TypeScript utility library*

**326 commits | 5,496 lines of TypeScript | 0.0.1 → 0.0.311**

---

## Overview

**ts-gist-pile** is a foundational TypeScript utility library born from the philosophy: "tired of finding this on stackoverflow". It provides core utilities, logging infrastructure, dependency injection, document store abstraction, and exception handling patterns used across the plumbmaker and lito-repo ecosystem.

**Key Design Principles:**
- **Explicit over magic**: No decorators, no hidden behavior
- **Browser-friendly**: Minimal dependencies, small footprint
- **Program to interfaces**: Enable swappable implementations
- **Crash by default**: Let operational errors fail-fast
- **Zero config**: Works out of the box with sensible defaults

**Current Status (v0.0.311):**
- 5,496 lines of TypeScript across 49 modules
- Zero runtime dependencies (uuid and @opentelemetry/api are only deps)
- CommonJS for maximum compatibility
- Published to GitHub Package Registry

---

## Timeline by Major Features

### 2023-10: Project Foundation (Oct 20 - Dec 31)

**Initial Commit: October 20, 2023**
- Basic project structure with TypeScript, Mocha, Chai
- `DateProviderService` - First service interface for testability
- Initial dependency: `lodash.clonedeep`

**Logging System Emerges (Oct 30 - Nov 6)**
- `getLogger()` - Core logging interface
- `logUtil` - Logging utilities
- `LogTester` - Testing infrastructure for logs
- Early support for StatHat metrics (later removed)

**Utility Foundation (Nov - Dec)**
- `booleanUtil`, `stringUtil`, `numberUtil` - Type utilities
- `diceUtil`, `uuidUtil` - Randomness and ID generation (Nov 26)
- `dateUtil` - Date manipulation functions (Dec 22)
- `UtcGetterService` - Testable UTC time access (Dec 24)
- `TimestampBucketMakingService` - Time bucketing for analytics

**Version progression:** 0.0.1 → 0.0.23 (23 versions in ~10 weeks)

### 2024: Feature Expansion and LLM Integration (49 commits)

**Q1 2024: Stability and Browser Compatibility**
- `safeStringify()` - Safe JSON serialization (Jan 2)
- `LOG_TO_STDERR` environment variable support (Jan 7)
- Removed `async_hooks` dependency for browser compatibility (Jan 23)
- Fix `d4l()` for error serialization (Jan 2)

**Q2 2024: CSV and JSON Handling**
- `CsvDataExtractor` - First CSV support (Jun 21)
- `JsonValue` types - Strongly typed JSON (Jul 4)
- `mapUtil` - Map data structure utilities (Jul 4)

**Q3 2024: LLM and Email Abstractions**
- **LLM interfaces** (Jul 10) - Major milestone:
  - `LlmConversationService` - Conversation management
  - `LlmQuery`, `LlmResponse`, `LlmQAndA` - Query/response patterns
  - `LlmQueryImpl` - Concrete implementation (Jul 16)
- **Email interfaces** (Jul 10-11):
  - `TgpEmail` → renamed to `GpEmail` (Jul 11)
  - `GpEmailGroup`, `GpEmailMixedMultipart` - MIME support
- `jsonUtil` - JSON manipulation utilities (Jul 16)
- `JsonArray`, `JsonObject`, `JsonObjectOrArray` - Type safety (Jul 17)

**Q4 2024: Object Utilities and Events**
- `ObjectIdFinder` - Object ID extraction (Sep 3)
- `d4l()` enhanced with `LogOptions.joinLines` (Sep 16)
- StatHat metrics support for WARN/FATAL levels (Sep 16)
- `safeStringify` improvements (Sep 30)
- `Happening` and `HappeningPublishService` - Event abstractions (Oct 26)

**Version progression:** 0.0.25 → 0.0.45 (20 versions)

### 2025: Maturation and Production Features (216 commits - 66% of all commits)

**Q1 2025: Foundation Refactoring**
- `functionUtil` - Function utilities (Jan 11)
- `d4lObfuscate` - Sensitive data obfuscation (Feb 9)
- AsyncLocalStorage restored for server environments (Feb 9)
- **Exception hierarchy** (Feb 19 - Mar 5):
  - `ProgrammerErrorException` - Fatal programmer errors (Feb 19)
  - `ResultOrErr` - Result type pattern (Feb 19)
  - `CollectionWithMeta` - Paginated results (Feb 19)
  - `BadRequest400Exception`, `Forbidden403Exception`, `NotFound404Exception` (Mar 5)
  - `ActuallyUnauthenticated401Exception` (Mar 5)
  - `InternalServerError500Exception`, `ServiceUnavailable503Exception` (Mar 7)
  - `ArgumentException`, `NotImplementedException` (Apr 25)
- `arrayUtil` - Array manipulation (Mar 7)
- `objectUtil.clone` - Deep cloning without lodash (Mar 14)

**Q2 2025: OpenTelemetry and Observability**
- `TraceInitializer` - OpenTelemetry setup (Apr 25)
- `DiagConsoleLogger` - OTEL diagnostics (Apr 25)
- Logging aligned with OpenTelemetry standards (Apr 28):
  - `trace_id` instead of `traceId` for JSON logs
  - OTEL context integration
- `JsonApiError` - Standardized error responses (Jun 14)
- `tryUtil` - Try/catch utilities (Jun 14)
- `ResultTuple` - Multi-value results (Jun 14)
- `cloneUtil` - Replace lodash.clonedeep dependency (Jun 14)
- `radixUtil` - Base conversion utilities (Jun 24)
- `idUtil` - ID generation patterns (Jun 24)

**Q3 2025: Date/Time and LLM Evolution**
- `dateUtil` enhancements (Jul 2)
- `TsGistPile.js` - Runtime helper script (Jul 17)
- `anyUtil` - Type utilities (Jul 17)
- Happening improvements - More OTEL-like (Aug 3)

**Q4 2025: Major Architecture Additions**
- **OpenTelemetry API abstraction** (Oct 1):
  - `opentelemetry/api` - Wrapper around @opentelemetry/api
  - `NoOpSpanEndHandler`, `NoOpAddEventHandler` - No-op implementations
  - `SpanEndHandlingService`, `AddEventHandlerService` - Service abstractions
  - `OtelLikeHappening` - OTEL-compatible event tracking
- **Async Local Storage refactor** (Oct 12):
  - Changed from Map to plain object for better performance
- **HIPAA/GDPR/PCI compliance** (Oct 15):
  - PII sanitizer for logs
  - `d4lSanitize()` - Automatic PII removal
  - Compliance-friendly logging patterns
- **SimplestKeyValueStore** (Oct 16):
  - Minimal key-value interface
  - Foundation for simple caching
- **Dependency Injection Container** (Oct 17):
  - `Container` - Lightweight DI container (2 KB compiled)
  - Inversify-compatible API
  - Manual instantiation (no decorators)
  - 600x smaller than full Inversify stack
  - Comprehensive documentation: DEPENDENCY_INJECTION.md
- **Document Store abstraction** (Oct 22):
  - `DocumentStoreService` - NoSQL-like interface
  - `RetryPolicy` - Eventual consistency handling
  - `ReadAfterWriteOptions` - Consistency validation
  - Swappable implementations (DynamoDB, MongoDB, Firestore, Postgres)
- **Retry utilities** (Oct 22):
  - `retryUtil.retryWithBackoff` - Exponential backoff
  - Jitter support
  - Configurable retry policies
- **Metrics abstraction** (Oct 22):
  - `MetricsService` - Metrics interface
  - Foundation for observability
- **Advanced log configuration** (Oct 23):
  - `LOG_RULES` - Pattern-based log level configuration
  - Static export API for compile-time configuration
  - Runtime override capability
  - Comprehensive documentation: LOG_LEVEL_CONFIGURATION.md
- **Environment detection** (Oct 23):
  - `isTestLikeEnv()` - Detect test environments
  - Support for multiple test frameworks

**Version progression:** 0.0.46 → 0.0.311 (265 versions!)

**Dependency evolution:**
- Removed `lodash.clonedeep` (Oct 19, 2025) - Zero lodash dependencies
- Added `uuid` v11.1.0 for ID generation
- Added `@opentelemetry/api` for observability
- Final state: Only 2 runtime dependencies (uuid, @opentelemetry/api)

---

## Major Components History

### Logging System Evolution

**Phase 1: Foundation (Oct-Dec 2023)**
- `getLogger()` - Basic logger interface
- StatHat metrics integration (later removed Dec 2023)
- `logUtil` - Utility functions
- JSON output for structured logging

**Phase 2: Enhancement (2024)**
- `d4l()` - "Dump for Log" serialization function
- `safeStringify()` - Safe JSON serialization
- `LogOptions.joinLines` - Multi-line log handling
- StatHat reintroduced for error tracking (Sep 2024)

**Phase 3: Observability (2025 Q2)**
- OpenTelemetry integration (Apr 2025)
- `trace_id` standardization
- AsyncLocalStorage for request context
- `DiagConsoleLogger` for OTEL diagnostics

**Phase 4: Compliance & Configuration (2025 Q4)**
- PII sanitizer (Oct 15) - HIPAA/GDPR/PCI compliance
- `d4lSanitize()` - Automatic sensitive data removal
- Pattern-based log levels (Oct 23):
  - `LOG_RULES.levels` - Compile-time configuration
  - `LOG_LEVEL` environment variable
  - Per-logger pattern matching
  - Static export API
- Comprehensive documentation system

**Key Features (Current):**
- Structured JSON logging
- OpenTelemetry trace context
- PII/sensitive data sanitization
- Pattern-based log level control
- Lambda/arrow function for lazy evaluation
- Request context via AsyncLocalStorage
- Browser and Node.js compatible

### Dependency Injection Container

**Created: October 17, 2025 (v0.0.302)**

A watershed moment - after nearly 2 years, the project gained its own DI container:

**Design Philosophy:**
- **Explicit over magic** - Manual instantiation, no decorators
- **Tiny footprint** - 2 KB compiled (vs 1.4 MB for Inversify)
- **API compatible** - Drop-in compatible with Inversify's manual mode
- **Zero dependencies** - No reflection, no decorators
- **Browser-friendly** - Works in any JavaScript environment

**API Surface:**
```typescript
class Container {
  bind<T>(serviceIdentifier: ServiceIdentifier): BindingInWhenOnSyntax<T>
  get<T>(serviceIdentifier: ServiceIdentifier): T
  rebind<T>(serviceIdentifier: ServiceIdentifier): BindingInWhenOnSyntax<T>
  unbind(serviceIdentifier: ServiceIdentifier): void
  unbindAll(): void
  isBound(serviceIdentifier: ServiceIdentifier): boolean
}
```

**Implementation:**
- 151 lines of TypeScript
- Constant value bindings only (singletons)
- Symbol or string identifiers
- Service locator pattern support
- Comprehensive test suite (252 lines)

**Documentation:**
- DEPENDENCY_INJECTION.md (33 KB)
- Comparison with Inversify
- Migration guides
- Real-world examples
- Testing patterns

**Impact:**
- Enables DI in browser/client apps without 1.4 MB overhead
- Perfect for libraries (don't force deps on users)
- Teaching tool for DI patterns
- Seamless upgrade path to Inversify

### Document Store Abstraction

**Created: October 22, 2025 (v0.0.307-0.0.309)**

Abstracts NoSQL document databases behind a clean interface:

**Core Interface:**
```typescript
interface DocumentStoreService {
  // CRUD operations
  getDocument<T>(table: string, key: Record<string, any>): Promise<T | null>
  putDocument<T>(table: string, data: T): Promise<void>
  updateDocument<T>(table: string, key: Record<string, any>, updates: Partial<T>): Promise<void>
  deleteDocument(table: string, key: Record<string, any>): Promise<void>

  // Querying
  queryDocuments<T>(table: string, options: QueryOptions): Promise<T[]>
  scanDocuments<T>(table: string, options: ScanOptions): Promise<T[]>

  // Batch operations
  batchGetDocuments<T>(table: string, keys: Record<string, any>[]): Promise<T[]>
  batchPutDocuments<T>(table: string, data: T[]): Promise<void>
}
```

**Supporting Types:**
- `RetryPolicy` - Configurable retry with exponential backoff
- `ReadAfterWriteOptions` - Eventual consistency handling
- Query operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$exists`, `$contains`

**Supported Implementations:**
- DynamoDB (AWS)
- MongoDB
- Firestore (Google Cloud)
- SimplePostgresDocumentStoreServiceImpl (Postgres JSONB - used in plumbmaker)

**Design Pattern:**
- Program to interface, swap implementations
- Retry policy for transient failures
- Read-after-write consistency helpers
- Filter/projection support
- Pagination built-in

### Exception Hierarchy

**Developed: February-March 2025**

Comprehensive exception system following "crash by default" philosophy:

**Hierarchy:**
```
Error (JavaScript native)
├─ ProgrammerErrorException (NEVER catch - always crash)
├─ BadRequest400Exception (operational - catch and handle)
├─ ActuallyUnauthenticated401Exception (operational)
├─ Forbidden403Exception (operational)
├─ NotFound404Exception (operational)
├─ InternalServerError500Exception (operational)
├─ ServiceUnavailable503Exception (operational)
├─ ArgumentException (operational)
└─ NotImplementedException (operational)
```

**Philosophy:**
- **Programmer errors** → Crash immediately (ProgrammerErrorException)
- **Operational errors** → Explicitly catch and handle (HTTP exceptions)
- **Unexpected errors** → Crash (unhandled rejections/exceptions)

**Usage Pattern:**
```typescript
// NEVER catch ProgrammerErrorException - let it crash
throw new ProgrammerErrorException('Invalid state: should never happen');

// DO catch operational errors
try {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFound404Exception(`User ${id} not found`);
} catch (e) {
  if (e instanceof NotFound404Exception) {
    return res.status(404).json({ error: e.message });
  }
  throw e; // Re-throw unexpected errors
}
```

**Export Pattern:**
```typescript
import { extendedExceptionList } from '@jgithub/ts-gist-pile';
const { ProgrammerErrorException, NotFound404Exception } = extendedExceptionList;
```

**Result Types:**
- `ResultOrErr<T, E>` - Success or error result
- `ResultTuple` - Multi-value results
- Alternative to exception throwing for certain patterns

### Date/Time System

**Evolution: December 2023 - July 2025**

**Phase 1: Foundation (Dec 2023)**
- `DateProviderService` - Injectable date provider for testing
- `UtcGetterService` - UTC time access
- `TimestampBucketMakingService` - Time bucketing
- `dateUtil.generateSortedFiveMinuteBucketsForYear()` - Analytics support

**Phase 2: Enhancement (Jul 2025)**
- `ImmutableUtc` - Immutable date/time wrapper
- Additional `dateUtil` functions
- `getMillisecondsSinceDate()` - Performance timing

**Current Features:**
- Immutable date operations
- UTC-first design
- Testable time (injectable services)
- Time bucketing for analytics
- Performance timing utilities

### OpenTelemetry Integration

**Developed: April-October 2025**

**Phase 1: Foundation (Apr 2025)**
- `TraceInitializer` - OTEL setup
- `DiagConsoleLogger` - Diagnostics
- Logging standardization (`trace_id` format)

**Phase 2: Abstraction (Oct 2025)**
- `opentelemetry/api` - Wrapper around @opentelemetry/api
- `NoOpSpanEndHandler`, `NoOpAddEventHandler` - Default implementations
- `SpanEndHandlingService`, `AddEventHandlerService` - Service interfaces
- `OtelLikeHappening` - Event tracking aligned with OTEL

**Design Pattern:**
- Wrap OTEL APIs behind services
- Provide no-op defaults
- Allow swapping implementations
- Maintain OTEL compatibility

---

## Architecture Patterns

### Interface-Driven Design

From day one, ts-gist-pile emphasized programming to interfaces:

**Pattern:**
```typescript
// Define interface
export interface DateProviderService {
  getNow(): Date;
}

// Provide implementation
export class DateProviderServiceImpl implements DateProviderService {
  getNow(): Date {
    return new Date();
  }
}

// Test with mock
class MockDateProvider implements DateProviderService {
  getNow(): Date {
    return new Date('2025-01-01T00:00:00Z');
  }
}
```

**Rationale:**
- Enables testing with mocks
- Allows swapping implementations
- Makes dependencies explicit
- Supports DI patterns

### Service Naming Conventions

Established early and maintained consistently:
- Interface: `{Module}Service` (e.g., `DateProviderService`)
- Implementation: `{Module}ServiceImpl` (e.g., `DateProviderServiceImpl`)
- Test double: `Mock{Module}` or `Fake{Module}`

### Crash By Default Philosophy

Exception handling follows the "crash by default" principle:
- **Unhandled errors crash the process** - Better to fail-fast
- **Programmer errors always crash** - Never caught
- **Operational errors explicitly caught** - Only handled errors recovered
- See: https://www.joyent.com/node-js/production/design/errors

### Zero Magic, Explicit Code

Consistent design choices:
- No decorators (even in DI container)
- No hidden auto-wiring
- Manual instantiation
- Dependencies visible in code
- No reflection metadata

**Why:**
- Browser compatibility
- Smaller bundle sizes
- Easier debugging
- Clear dependency graphs
- No TypeScript special config

### Browser and Node.js Compatibility

From the start, designed to work everywhere:
- CommonJS modules for maximum compatibility
- Removed `async_hooks` when it blocked browser use (Jan 2024)
- Restored AsyncLocalStorage for Node.js (Feb 2025)
- Conditional imports for environment-specific features
- No Node.js-only APIs in core utilities

---

## Breaking Changes and Refactorings

### Major Refactorings

**1. Email interfaces rename (Jul 2024)**
- `TgpEmail` → `GpEmail`
- `TgpEmailGroup` → `GpEmailGroup`
- Rationale: Shorter namespace

**2. Lodash.clonedeep removal (Oct 2025)**
- Replaced with `objectUtil.clone` and `cloneUtil`
- Zero lodash dependencies achieved
- Bundle size reduction

**3. AsyncLocalStorage journey**
- Introduced early (2023)
- Removed for browser compatibility (Jan 2024)
- Restored conditionally (Feb 2025)
- Refactored from Map to object (Oct 2025)

**4. StatHat metrics**
- Added (Dec 2023)
- Removed (Dec 2023)
- Re-added for errors (Sep 2024)
- Pattern: Try, remove if problematic, re-add when needed

### API Stability

Despite 311 versions, core APIs remained remarkably stable:
- `getLogger()` - Unchanged since Nov 2023
- `DateProviderService` - Unchanged since Oct 2023
- Utility functions - Mostly additive changes
- Breaking changes rare and documented

---

## Statistics

### Commit Activity
- **Total commits:** 326
- **2023:** 61 commits (Oct-Dec only)
- **2024:** 49 commits
- **2025:** 216 commits (66% of all commits - through Oct)

### Version Progression
- **Starting version:** 0.0.1 (Oct 20, 2023)
- **Current version:** 0.0.311 (Oct 23, 2025)
- **Total versions:** 311
- **Average:** ~6 versions per week (2025)

### Code Metrics
- **Current TypeScript LOC:** 5,496 lines
- **Source directories:** 49 modules
- **Test coverage:** Comprehensive Mocha test suite
- **Build output:** CommonJS in `dist/`

### Module Breakdown
Major modules by category:

**Core Utilities (15 modules):**
- array, boolean, clone, date, number, object, string, type
- any, function, map, radix, stat, try, uuid

**Services (8 modules):**
- di (Container), documentstore, retry, cache, metrics
- trace, happening, opentelemetry

**Logging & Observability (3 modules):**
- log, audit, featureflags

**Data & I/O (5 modules):**
- csv, json, email, keyvalue, phone

**Error Handling (3 modules):**
- exception, error, result

**Testing & Development (3 modules):**
- tester, event, env

**LLM Integration (1 module):**
- llm (LlmConversationService, LlmQuery, LlmResponse)

**Job Queue (1 module):**
- jobqueue

**Specialized (10 modules):**
- id, dice, container, collection, timestamp

### Dependencies Over Time

**October 2023 (v0.0.1):**
```json
{
  "dependencies": {
    "lodash.clonedeep": "^4.5.0"
  },
  "devDependencies": {
    "@types/lodash.clonedeep": "^4.5.7",
    "@types/node": "^20.2.5",
    "typescript": "^5.0.4"
  }
}
```

**October 2025 (v0.0.311):**
```json
{
  "dependencies": {
    "@opentelemetry/api": "^1.9.0",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@opentelemetry/semantic-conventions": "^1.37.0",
    "@types/uuid": "^10.0.0",
    "@types/node": "^20.2.5",
    "typescript": "^5.9.3",
    "csv": "^6.4.1"
  }
}
```

**Key changes:**
- Removed lodash.clonedeep (replaced with internal implementation)
- Added uuid for ID generation
- Added @opentelemetry/api for observability
- Zero transitive dependencies from lodash

---

## Integration with Dependent Projects

### plumbmaker Usage

ts-gist-pile is deeply integrated into plumbmaker:

**Logging:**
```typescript
import { getLogger } from '@jgithub/ts-gist-pile';
const LOG = getLogger('auth.AuthService');
LOG.info(() => 'User authenticated');
```

**Dependency Injection:**
```typescript
import { Container } from '@jgithub/ts-gist-pile';
const container = new Container();
container.bind<UserService>(DI_TYPES.UserService).toConstantValue(userService);
```

**Document Store:**
```typescript
import { DocumentStoreService } from '@jgithub/ts-gist-pile';
class BudgetService {
  constructor(private readonly docStore: DocumentStoreService) {}
  async saveBudget(budget: Budget) {
    await this.docStore.putDocument('budgets', budget);
  }
}
```

**Exception Handling:**
```typescript
import { extendedExceptionList } from '@jgithub/ts-gist-pile';
const { NotFound404Exception } = extendedExceptionList;
if (!user) throw new NotFound404Exception(`User ${id} not found`);
```

**Date/Time:**
```typescript
import { DateProviderService, ImmutableUtc } from '@jgithub/ts-gist-pile';
const now = dateProvider.getNow();
const immutable = new ImmutableUtc(now);
```

### lito-repo Usage

Similar patterns with emphasis on:
- Logging with trace context
- Date utilities for time-based features
- Exception handling
- Utility functions (string, number, array)

---

## Key Design Decisions

### 1. Manual Instantiation Over Decorators

**Decision:** Use manual `new` instead of decorator-based auto-wiring

**Rationale:**
- Browser compatibility (no reflect-metadata)
- Explicit dependency graph
- Smaller bundle size
- No special TypeScript config
- Easier debugging

**Impact:**
- DI Container is 600x smaller than Inversify
- Works in any JavaScript environment
- Clear, readable code

### 2. CommonJS Over ESM

**Decision:** Use CommonJS modules, not ES modules

**Rationale:**
- Maximum compatibility
- Works with older Node.js
- Simpler testing setup
- No dual package hazards

**Trade-off:**
- Loses tree-shaking benefits
- Not "modern" but "compatible"

### 3. Program to Interfaces

**Decision:** Define service interfaces, implement separately

**Rationale:**
- Enables testing with mocks
- Allows swapping implementations
- Makes dependencies explicit
- Supports DI patterns

**Examples:**
- `DateProviderService` / `DateProviderServiceImpl`
- `DocumentStoreService` / `SimplePostgresDocumentStoreServiceImpl`
- `MetricsService` / (multiple implementations)

### 4. Zero Config Logging

**Decision:** Logging works immediately with no configuration

**Rationale:**
- Developer productivity
- Just call `getLogger('module')` and it works
- Sensible defaults (JSON to stdout)
- Configure later if needed

**Features:**
- Structured JSON output
- Lazy evaluation with lambdas
- PII sanitization built-in
- Pattern-based log levels

### 5. Crash By Default Error Handling

**Decision:** Let unexpected errors crash the process

**Rationale:**
- Better to fail-fast than continue in unknown state
- Programmer errors should never be caught
- Only operational errors explicitly handled
- See Joyent's error handling guide

**Pattern:**
```typescript
// Programmer error - never catch, always crash
if (!config.databaseUrl) {
  throw new ProgrammerErrorException('DATABASE_URL required');
}

// Operational error - catch and handle
try {
  const user = await findUser(id);
} catch (e) {
  if (e instanceof NotFound404Exception) {
    return null; // Handle gracefully
  }
  throw e; // Re-throw unexpected errors
}
```

### 6. Single Package, Multiple Concerns

**Decision:** One package with many utilities vs. many packages

**Rationale:**
- Easier dependency management
- Consistent versioning
- Shared TypeScript config
- Simpler publishing
- Common testing infrastructure

**Trade-off:**
- Larger package size
- Can't cherry-pick individual utilities
- All or nothing dependency

### 7. GitHub Package Registry

**Decision:** Publish to GitHub Packages, not npm

**Rationale:**
- Private by default
- Integrated with GitHub
- No npm account needed
- Good for internal tools

**Impact:**
- Requires GitHub authentication to install
- Not discoverable on npm
- Perfect for org-internal libraries

---

## Lessons Learned

### 1. Start Simple, Add Complexity When Needed

The DI Container is a perfect example:
- Could have used Inversify from day one
- Started without DI (just manual wiring)
- Added lightweight Container after 2 years
- Only 2 KB but solves 90% of use cases
- Easy upgrade path to full Inversify

**Lesson:** Don't over-engineer early. Add features when you feel the pain.

### 2. Browser Compatibility Matters

Multiple times had to remove Node.js-specific features:
- `async_hooks` removed (Jan 2024)
- Conditional imports added
- No-op implementations for unavailable APIs

**Lesson:** Design for the most constrained environment (browser) first.

### 3. Dependencies Are Liabilities

Journey to zero lodash dependencies:
- Started with `lodash.clonedeep`
- Realized it's just a function
- Implemented `objectUtil.clone` and `cloneUtil`
- Removed dependency completely (Oct 2025)

**Lesson:** Every dependency is a liability. Implement yourself when simple.

### 4. Documentation Is Code

Multiple documentation files created:
- `DEPENDENCY_INJECTION.md` (33 KB)
- `LOG_LEVEL_CONFIGURATION.md`
- `EXAMPLES_LOG_CONFIG.md`
- `IMMUTABLE_UTC_USAGE.md`
- README files in modules

**Lesson:** Comprehensive docs increase adoption and reduce questions.

### 5. Testing Infrastructure Pays Off

From day one:
- Mocha + Chai test suite
- Test utilities (LogTester)
- Mock implementations
- Comprehensive test coverage

**Lesson:** Testing infrastructure enables confident refactoring.

### 6. Version Frequently

311 versions in 2 years = ~3 versions per week

**Benefits:**
- Small, atomic changes
- Easy rollback
- Clear history
- Fast iteration

**Lesson:** Don't batch changes. Ship frequently.

### 7. Interface Stability Matters

Despite 311 versions, core interfaces remained stable:
- `getLogger()` unchanged since Nov 2023
- `DateProviderService` unchanged since Oct 2023
- Additive changes preferred over breaking changes

**Lesson:** Get the interface right early. Add, don't break.

### 8. Explicit Over Magic

Manual instantiation vs. decorators:
- More verbose
- Easier to debug
- Clearer dependencies
- Browser-friendly

**Lesson:** Magic is convenient but costly. Explicit is better.

---

## Future Directions

Based on the development trajectory, likely future additions:

### 1. Enhanced Observability
- More metrics interfaces
- Distributed tracing patterns
- Performance monitoring utilities

### 2. Document Store Implementations
- Full DynamoDB implementation
- MongoDB implementation
- Firestore implementation
- In-memory implementation for testing

### 3. Advanced Retry Patterns
- Circuit breaker
- Rate limiting
- Bulkhead pattern
- Timeout handling

### 4. Job Queue Abstraction
- Currently just placeholders
- Full interface for background jobs
- Multiple implementations (BullMQ, SQS, etc.)

### 5. Cache Abstraction
- Currently minimal
- Full cache interface
- Multiple implementations (Redis, Memcached, in-memory)

### 6. Testing Utilities
- More test helpers
- Mock builders
- Fixture management
- Test data generation

### 7. Browser-Specific Utilities
- Local storage wrappers
- Session management
- Client-side error tracking
- Browser feature detection

---

## Conclusion

ts-gist-pile has evolved from a simple collection of Stack Overflow solutions into a comprehensive foundational library. Over 2 years and 326 commits, it has maintained a clear philosophy:

**Core Philosophy:**
- Explicit over magic
- Program to interfaces
- Crash by default
- Browser-friendly
- Zero config
- Dependencies are liabilities

**Key Achievements:**
- 5,496 lines of production TypeScript
- 49 modules covering utilities, logging, DI, document store, exceptions
- Zero lodash dependencies
- 2 KB DI container compatible with Inversify
- Comprehensive exception hierarchy
- OpenTelemetry integration
- HIPAA/GDPR/PCI compliant logging
- Document store abstraction

**Impact:**
- Powers plumbmaker and lito-repo
- Enables testable, maintainable code
- Reduces boilerplate across projects
- Provides consistent patterns

The project demonstrates that with clear principles, consistent execution, and frequent iteration, a small utility library can become an indispensable foundation for larger systems. The emphasis on explicitness, interfaces, and compatibility has created a library that is both powerful and approachable.

**From "tired of finding this on stackoverflow" to a production-grade utility library in 2 years.**

---

*Document generated: October 2025*
*Repository: https://github.com/jgithub/ts-gist-pile*
*Package: @jgithub/ts-gist-pile v0.0.311*
