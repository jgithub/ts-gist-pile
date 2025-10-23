# Log Level Configuration Guide

This guide explains how to configure logging levels for different parts of your application.

## Quick Start

### Option 1: JavaScript Configuration File (Recommended)

Create a file named `log-level-rules.js` in your project root:

```javascript
module.exports = {
  rules: [
    { pattern: 'api.users', level: 'TRACE' },
    { pattern: 'api.*', level: 'DEBUG' },
    { pattern: 'db.*', level: 'WARN' },
    { pattern: '*', level: 'INFO' }
  ]
};
```

**Benefits:**
- ✅ No recompilation needed - just edit the file and restart your app
- ✅ Syntax highlighting and validation in your IDE
- ✅ Can add comments to explain why certain loggers are verbose
- ✅ Version controlled - see history of log level changes
- ✅ Can use JavaScript logic for environment-specific rules

### Option 2: Environment Variable

For simple cases or when you can't use a file:

```bash
export LOG_LEVEL_RULES='[{"pattern":"api.*","level":"DEBUG"},{"pattern":"*","level":"WARN"}]'
```

## Configuration Priority

Log levels are determined in this order (first match wins):

1. **JavaScript file** specified in `LOG_LEVEL_RULES_FILE` env var
2. **Default JavaScript files**: `./log-level-rules.js` or `./config/log-level-rules.js`
3. **JSON env var**: `LOG_LEVEL_RULES`
4. **Legacy env vars**: `LOG_TRACE`, `LOG_DEBUG`, `LOG_INFO`
5. **Default behavior**: NOTICE and above always enabled

## Pattern Matching

Rules are evaluated in order - **first match wins**. Put more specific patterns first, general fallback patterns last.

### Pattern Syntax

| Pattern | Matches | Example Matches |
|---------|---------|----------------|
| `"api.users"` | Exact match only | `api.users` |
| `"api.*"` | Suffix wildcard | `api.users`, `api.products`, `api.auth` |
| `"*.service"` | Prefix wildcard | `api.service`, `db.service`, `cache.service` |
| `"api.*.controller"` | Middle wildcard | `api.users.controller`, `api.products.controller` |
| `"*"` | Catch-all | Everything |

### Pattern Examples

```javascript
module.exports = {
  rules: [
    // Most specific first
    { pattern: 'api.users.controller', level: 'TRACE' },
    { pattern: 'api.users.*', level: 'DEBUG' },

    // More general
    { pattern: 'api.*', level: 'INFO' },
    { pattern: 'db.*', level: 'WARN' },

    // Catch-all fallback
    { pattern: '*', level: 'ERROR' }
  ]
};
```

## Log Levels

Levels in order of verbosity (most to least):

| Level | Description | Use Case |
|-------|-------------|----------|
| `TRACE` | Most verbose | Detailed debugging, tracing execution flow |
| `DEBUG` | Debug info | Development debugging |
| `INFO` | Informational | General application flow |
| `NOTICE` | Notable events | Significant but normal events |
| `WARN` | Warnings | Warning conditions that don't stop execution |
| `ERROR` | Errors | Error conditions |
| `FATAL` | Critical errors | Critical failures that may cause shutdown |

When you set a logger to a level, it will log that level **and all levels above it**.

Example: Setting `level: 'INFO'` will log INFO, NOTICE, WARN, ERROR, and FATAL (but not DEBUG or TRACE).

## Environment-Specific Configuration

### Using Environment Detection

```javascript
// log-level-rules.js
const env = process.env.NODE_ENV || 'development';

const developmentRules = [
  { pattern: 'api.*', level: 'DEBUG' },
  { pattern: '*', level: 'INFO' }
];

const productionRules = [
  { pattern: 'api.*', level: 'INFO' },
  { pattern: '*', level: 'ERROR' }
];

module.exports = {
  rules: env === 'production' ? productionRules : developmentRules
};
```

### Using Custom Environment Variable

Point to different config files per environment:

```bash
# Development
export LOG_LEVEL_RULES_FILE=./config/log-levels.dev.js

# Production
export LOG_LEVEL_RULES_FILE=./config/log-levels.prod.js
```

## Advanced Examples

### Debugging Specific Features

```javascript
// Temporarily enable verbose logging for user authentication debugging
module.exports = {
  rules: [
    { pattern: 'api.auth.*', level: 'TRACE' },  // Very verbose for auth
    { pattern: 'api.users.login', level: 'TRACE' },
    { pattern: 'api.*', level: 'INFO' },
    { pattern: '*', level: 'WARN' }
  ]
};
```

### Production with Selective Debugging

```javascript
// Production config with specific debugging enabled
module.exports = {
  rules: [
    // Debug specific issue in production
    { pattern: 'api.payment.processor', level: 'DEBUG' },

    // Everything else is quiet
    { pattern: 'api.*', level: 'WARN' },
    { pattern: '*', level: 'ERROR' }
  ]
};
```

### Feature Flag Based Configuration

```javascript
// log-level-rules.js
const debugPayments = process.env.DEBUG_PAYMENTS === 'true';
const debugAuth = process.env.DEBUG_AUTH === 'true';

const rules = [];

if (debugPayments) {
  rules.push({ pattern: 'api.payment.*', level: 'TRACE' });
}

if (debugAuth) {
  rules.push({ pattern: 'api.auth.*', level: 'TRACE' });
}

// Default rules
rules.push(
  { pattern: 'api.*', level: 'INFO' },
  { pattern: '*', level: 'WARN' }
);

module.exports = { rules };
```

## File Locations

### Default Locations

The logger automatically checks these locations (in order):

1. `./log-level-rules.js` (project root)
2. `./config/log-level-rules.js` (config directory)

### Custom Location

Use the `LOG_LEVEL_RULES_FILE` environment variable:

```bash
export LOG_LEVEL_RULES_FILE=./my-custom-path/log-config.js
```

## Best Practices

### ✅ DO

- Put most specific patterns first (first match wins)
- Use a catch-all `*` pattern at the end as a fallback
- Add comments explaining why verbose logging is enabled
- Use environment detection for different verbosity in dev vs prod
- Commit `log-level-rules.example.js` but add `log-level-rules.js` to `.gitignore`
- Use DEBUG/TRACE in development, INFO/WARN in production

### ❌ DON'T

- Don't put general patterns before specific ones (they'll match first!)
- Don't enable TRACE in production for everything (performance impact)
- Don't commit your local `log-level-rules.js` (use `.gitignore`)
- Don't forget to restart your app after changing the config file

## Troubleshooting

### My rules aren't being applied

1. Check the console output - you should see: `[LOG CONFIG] Loaded N log level rules from <path>`
2. Verify the file exists and has the correct syntax
3. Remember: **first match wins** - check pattern order
4. Restart your application after changing the config file

### Too much output in production

```javascript
// Use a more restrictive default
module.exports = {
  rules: [
    { pattern: '*', level: 'ERROR' }  // Only errors in production
  ]
};
```

### Need to debug specific logger in production

```javascript
module.exports = {
  rules: [
    { pattern: 'problem.area.*', level: 'DEBUG' },  // Debug just this area
    { pattern: '*', level: 'ERROR' }                // Everything else quiet
  ]
};
```

### Config file not being found

```bash
# Explicitly set the path
export LOG_LEVEL_RULES_FILE=/absolute/path/to/log-level-rules.js

# Or use relative path from project root
export LOG_LEVEL_RULES_FILE=./config/log-level-rules.js
```

## Migration from Legacy Configuration

If you're currently using `LOG_DEBUG=true`, `LOG_INFO=true`, etc.:

### Before
```bash
export LOG_DEBUG=true
export LOG_INFO=true
```

### After
```javascript
// log-level-rules.js
module.exports = {
  rules: [
    { pattern: '*', level: 'DEBUG' }  // Equivalent to LOG_DEBUG=true
  ]
};
```

The old environment variables still work as a fallback if no rules match.

## Example Configuration Files

See `log-level-rules.example.js` for a complete example with environment-specific rules and detailed comments.
