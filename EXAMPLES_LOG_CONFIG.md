# Log Level Configuration Examples

## Recommended Approach: Static Export

The cleanest way to configure log levels is using the exported `LOG_RULES` object at the top of your application entry point.

### Basic Setup

```typescript
// app.ts or index.ts (your entry point)
import { LOG_RULES, getLogger } from 'ts-gist-pile';

// Configure log levels BEFORE creating any loggers
LOG_RULES.levels.push(
  { pattern: 'api.users', level: 'TRACE' },
  { pattern: 'api.*', level: 'DEBUG' },
  { pattern: 'db.*', level: 'WARN' },
  { pattern: '*', level: 'INFO' }
);

// Now use loggers throughout your app
const logger = getLogger('api.users');
logger.debug('This will appear');
```

### Environment-Based Configuration

```typescript
// config/log-config.ts
import { LOG_RULES } from 'ts-gist-pile';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

if (isDev) {
  LOG_RULES.levels.push(
    { pattern: 'api.*', level: 'DEBUG' },
    { pattern: 'db.*', level: 'DEBUG' },
    { pattern: '*', level: 'INFO' }
  );
} else if (isProd) {
  LOG_RULES.levels.push(
    { pattern: 'api.*', level: 'INFO' },
    { pattern: 'db.*', level: 'WARN' },
    { pattern: '*', level: 'ERROR' }
  );
} else {
  // Staging or other environments
  LOG_RULES.levels.push(
    { pattern: '*', level: 'INFO' }
  );
}

// Then in your entry point:
// import './config/log-config';
```

### Separate Config Module

```typescript
// config/logging.ts
import { LOG_RULES } from 'ts-gist-pile';

export function configureLogging() {
  LOG_RULES.levels = [
    { pattern: 'api.auth.*', level: 'DEBUG' },
    { pattern: 'api.*', level: 'INFO' },
    { pattern: 'db.*', level: 'WARN' },
    { pattern: '*', level: 'INFO' }
  ];
}

// In your app entry point:
// import { configureLogging } from './config/logging';
// configureLogging();
```

### Feature Flag Based

```typescript
// config/log-config.ts
import { LOG_RULES } from 'ts-gist-pile';

const rules: Array<{ pattern: string; level: string }> = [];

// Feature-specific debugging
if (process.env.DEBUG_PAYMENTS === 'true') {
  rules.push({ pattern: 'payment.*', level: 'TRACE' });
}

if (process.env.DEBUG_AUTH === 'true') {
  rules.push({ pattern: 'auth.*', level: 'TRACE' });
}

// Default rules
rules.push(
  { pattern: 'api.*', level: 'INFO' },
  { pattern: '*', level: 'WARN' }
);

LOG_RULES.levels = rules;
```

### Merging with Base Configuration

```typescript
// config/base-log-config.ts
export const BASE_LOG_RULES = [
  { pattern: 'api.*', level: 'INFO' },
  { pattern: 'db.*', level: 'WARN' },
  { pattern: '*', level: 'INFO' }
];

// config/dev-overrides.ts
import { LOG_RULES } from 'ts-gist-pile';
import { BASE_LOG_RULES } from './base-log-config';

// Start with base config
LOG_RULES.levels = [...BASE_LOG_RULES];

// Add dev-specific overrides (more specific patterns first!)
LOG_RULES.levels.unshift(
  { pattern: 'api.users.controller', level: 'TRACE' },
  { pattern: 'api.users.*', level: 'DEBUG' }
);
```

### Dynamic Updates (Advanced)

```typescript
import { LOG_RULES, getLogger } from 'ts-gist-pile';

// Initial configuration
LOG_RULES.levels = [
  { pattern: '*', level: 'INFO' }
];

const logger = getLogger('my.service');

// Later, you can update the rules
export function enableDebugForService(servicePattern: string) {
  // Add debug rule at the beginning (first match wins)
  LOG_RULES.levels.unshift({
    pattern: servicePattern,
    level: 'DEBUG'
  });

  // Clear the cache to pick up new rules
  const { resetLogLevelRulesCache } = require('ts-gist-pile/dist/log/getLogger');
  resetLogLevelRulesCache();
}

// Usage:
// enableDebugForService('payment.*');
```

## Priority Order

Configuration sources in priority order:

1. **LOG_RULES.levels** (static export - HIGHEST PRIORITY)
2. JavaScript file from `LOG_LEVEL_RULES_FILE` env var
3. Default JS files (`./log-level-rules.js` or `./config/log-level-rules.js`)
4. JSON from `LOG_LEVEL_RULES` env var
5. Legacy env vars (`LOG_DEBUG`, `LOG_INFO`, etc.)
6. Default behavior (NOTICE and above)

## Best Practices

### ✅ DO

```typescript
// Configure at app startup
import { LOG_RULES } from 'ts-gist-pile';

LOG_RULES.levels.push(
  { pattern: 'api.users', level: 'DEBUG' },  // Most specific first
  { pattern: 'api.*', level: 'INFO' },
  { pattern: '*', level: 'WARN' }             // Catch-all last
);
```

### ❌ DON'T

```typescript
// Don't configure after creating loggers (won't take effect)
const logger = getLogger('api.users');

// Too late!
LOG_RULES.levels.push({ pattern: 'api.*', level: 'DEBUG' });
logger.debug('This won\'t appear');  // Cache already set

// If you must change rules after loggers exist, clear the cache:
import { resetLogLevelRulesCache } from 'ts-gist-pile/dist/log/getLogger';
resetLogLevelRulesCache();
```

```typescript
// Don't put general patterns before specific ones
LOG_RULES.levels = [
  { pattern: '*', level: 'ERROR' },           // ❌ This matches everything!
  { pattern: 'api.users', level: 'DEBUG' }    // ❌ Never reached
];

// Instead:
LOG_RULES.levels = [
  { pattern: 'api.users', level: 'DEBUG' },   // ✅ Specific first
  { pattern: '*', level: 'ERROR' }            // ✅ General last
];
```

## Pattern Matching Reference

| Pattern | Matches |
|---------|---------|
| `"api.users"` | Only `"api.users"` |
| `"api.*"` | `"api.users"`, `"api.products"`, `"api.auth"` |
| `"*.service"` | `"api.service"`, `"db.service"`, `"cache.service"` |
| `"api.*.controller"` | `"api.users.controller"`, `"api.products.controller"` |
| `"*"` | Everything |

## Log Levels

From most to least verbose:

- `TRACE` - Detailed execution flow
- `DEBUG` - Development debugging
- `INFO` - General information
- `NOTICE` - Significant normal events
- `WARN` - Warnings
- `ERROR` - Errors
- `FATAL` - Critical failures

Setting a level enables that level and all above it.
Example: `level: 'INFO'` enables INFO, NOTICE, WARN, ERROR, and FATAL.
