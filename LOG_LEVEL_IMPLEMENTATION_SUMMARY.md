# Log Level Configuration Implementation Summary

## What Was Implemented

Pattern-based log level configuration with a clean static export API.

## Primary Usage (Recommended)

```typescript
import { LOG_RULES, getLogger } from 'ts-gist-pile';

// Configure at app startup (before creating loggers)
LOG_RULES.levels.push(
  { pattern: 'api.users', level: 'TRACE' },
  { pattern: 'api.*', level: 'DEBUG' },
  { pattern: 'db.*', level: 'WARN' },
  { pattern: '*', level: 'INFO' }
);

// Use loggers as normal
const logger = getLogger('api.users');
logger.trace('Very detailed logging');
logger.debug('Debug info');
```

## Key Features

### 1. Static Export API
- **No runtime file loading required**
- **No JSON fat-fingering**
- Direct code-based configuration with TypeScript type safety
- Can modify at runtime if needed (with cache reset)

### 2. Pattern Matching (First Match Wins)
- Exact: `"api.users"` matches only `"api.users"`
- Suffix: `"api.*"` matches `"api.users"`, `"api.products"`, etc.
- Prefix: `"*.service"` matches `"api.service"`, `"db.service"`, etc.
- Multiple: `"api.*.controller"` matches `"api.users.controller"`, etc.
- Catch-all: `"*"` matches everything

### 3. Multiple Configuration Sources (Priority Order)

1. **`LOG_RULES.levels`** - Static export (HIGHEST PRIORITY)
2. **JS file from `LOG_LEVEL_RULES_FILE`** env var
3. **Default JS files** - `./log-level-rules.js` or `./config/log-level-rules.js`
4. **JSON env var** - `LOG_LEVEL_RULES`
5. **Legacy env vars** - `LOG_DEBUG`, `LOG_INFO`, etc.
6. **Default** - NOTICE and above

## Configuration Examples

### Basic Setup
```typescript
// app.ts
import { LOG_RULES } from 'ts-gist-pile';

LOG_RULES.levels = [
  { pattern: 'api.*', level: 'DEBUG' },
  { pattern: '*', level: 'INFO' }
];
```

### Environment-Based
```typescript
// config/logging.ts
import { LOG_RULES } from 'ts-gist-pile';

if (process.env.NODE_ENV === 'production') {
  LOG_RULES.levels = [
    { pattern: 'api.*', level: 'INFO' },
    { pattern: '*', level: 'ERROR' }
  ];
} else {
  LOG_RULES.levels = [
    { pattern: 'api.*', level: 'DEBUG' },
    { pattern: '*', level: 'INFO' }
  ];
}
```

### Feature Flags
```typescript
import { LOG_RULES } from 'ts-gist-pile';

const rules = [];

if (process.env.DEBUG_PAYMENTS === 'true') {
  rules.push({ pattern: 'payment.*', level: 'TRACE' });
}

rules.push(
  { pattern: 'api.*', level: 'INFO' },
  { pattern: '*', level: 'WARN' }
);

LOG_RULES.levels = rules;
```

## Fallback Options

If you can't use the static export, alternatives exist:

### Option 1: JavaScript File
```javascript
// log-level-rules.js
module.exports = {
  rules: [
    { pattern: 'api.*', level: 'DEBUG' }
  ]
};
```

### Option 2: Environment Variable
```bash
export LOG_LEVEL_RULES='[{"pattern":"api.*","level":"DEBUG"}]'
```

### Option 3: Custom File Path
```bash
export LOG_LEVEL_RULES_FILE=./config/custom-log-rules.js
```

## Log Levels

From most to least verbose:
- `TRACE` - Most detailed
- `DEBUG` - Debug info
- `INFO` - General info
- `NOTICE` - Significant events
- `WARN` - Warnings
- `ERROR` - Errors
- `FATAL` - Critical failures

Setting a level enables that level and all above it.

## Important Rules

### ✅ DO
- Configure `LOG_RULES.levels` at app startup (before creating loggers)
- Put specific patterns first, general patterns last (first match wins)
- Use a catch-all `*` pattern at the end
- Use different configs for dev/prod via environment detection

### ❌ DON'T
- Don't configure after creating loggers (won't take effect without cache reset)
- Don't put general patterns before specific ones
- Don't enable TRACE for everything in production

## Files Modified

- **src/log/getLogger.ts** - Added `LOG_RULES` export, pattern matching, multi-source config loading
- **src/index.ts** - Exported `LOG_RULES`
- **src/env/envUtil.ts** - Added `resetEnvVarCache()` for testing
- **test/log/logLevelRules.test.ts** - Comprehensive test suite

## Documentation

- **EXAMPLES_LOG_CONFIG.md** - Usage examples
- **LOG_LEVEL_CONFIGURATION.md** - Complete guide (includes JS file approach)

## Testing

All core functionality tested and working:
- Pattern matching (exact, wildcards, multiple wildcards)
- First match wins behavior
- Log level hierarchy
- Static export API
- Environment-based configuration
- Dynamic updates (with cache reset)

## Benefits Over JSON Env Var

1. **Type safety** - TypeScript catches errors at compile time
2. **No JSON syntax errors** - Direct JavaScript objects
3. **IDE support** - Autocomplete, validation, refactoring
4. **Comments** - Can explain why certain loggers are verbose
5. **Logic** - Can use conditionals, loops, etc.
6. **No escaping** - No shell escaping headaches
7. **Version control** - Easy to track changes in Git
8. **No recompilation** - Just restart the app

## Migration Path

### From Legacy Env Vars
```bash
# Old way
export LOG_DEBUG=true
export LOG_INFO=true
```

```typescript
// New way
import { LOG_RULES } from 'ts-gist-pile';
LOG_RULES.levels.push({ pattern: '*', level: 'DEBUG' });
```

### From JSON Env Var
```bash
# Old way
export LOG_LEVEL_RULES='[{"pattern":"api.*","level":"DEBUG"}]'
```

```typescript
// New way
import { LOG_RULES } from 'ts-gist-pile';
LOG_RULES.levels.push({ pattern: 'api.*', level: 'DEBUG' });
```

## Next Steps

1. Import the configuration module at your app entry point
2. Set `LOG_RULES.levels` before creating any loggers
3. Consider environment-specific configs (dev vs prod)
4. Add `.gitignore` entries if using fallback JS files
