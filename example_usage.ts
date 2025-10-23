/**
 * Example: How to configure log levels in your application
 *
 * This shows the recommended approach using the LOG_RULES static export.
 */

import { LOG_RULES, getLogger } from './src/index';

// ============================================================================
// STEP 1: Configure log levels at app startup (before creating loggers)
// ============================================================================

console.log('=== Configuring Log Levels ===\n');

// Option A: Replace entirely
LOG_RULES.levels = [
  { pattern: 'api.users.controller', level: 'TRACE' },  // Most specific first
  { pattern: 'api.users.*', level: 'DEBUG' },
  { pattern: 'api.*', level: 'INFO' },
  { pattern: 'db.*', level: 'WARN' },
  { pattern: '*', level: 'INFO' }                       // Catch-all last
];

// Option B: Or push to add rules
// LOG_RULES.levels.push(
//   { pattern: 'api.*', level: 'DEBUG' },
//   { pattern: '*', level: 'INFO' }
// );

console.log(`✓ Configured ${LOG_RULES.levels.length} log level rules\n`);

// ============================================================================
// STEP 2: Use loggers throughout your application
// ============================================================================

console.log('=== Using Loggers ===\n');

const apiUsersControllerLogger = getLogger('api.users.controller');
const apiUsersServiceLogger = getLogger('api.users.service');
const apiProductsLogger = getLogger('api.products');
const dbLogger = getLogger('db.connection');
const cacheLogger = getLogger('cache.redis');

// api.users.controller - TRACE level
console.log('--- api.users.controller (TRACE level) ---');
apiUsersControllerLogger.trace('Entering handleRequest()');
apiUsersControllerLogger.debug('Request params validated');
apiUsersControllerLogger.info('User authenticated');

// api.users.service - DEBUG level
console.log('\n--- api.users.service (DEBUG level) ---');
apiUsersServiceLogger.trace('Should NOT appear (below DEBUG)');
apiUsersServiceLogger.debug('Querying user database');
apiUsersServiceLogger.info('User found');

// api.products - INFO level
console.log('\n--- api.products (INFO level) ---');
apiProductsLogger.debug('Should NOT appear (below INFO)');
apiProductsLogger.info('Fetching product catalog');
apiProductsLogger.warn('Product cache miss');

// db.connection - WARN level
console.log('\n--- db.connection (WARN level) ---');
dbLogger.info('Should NOT appear (below WARN)');
dbLogger.warn('Connection pool at 90% capacity');
dbLogger.error('Query timeout after 5s');

// cache.redis - INFO level (from catch-all *)
console.log('\n--- cache.redis (INFO level from catch-all) ---');
cacheLogger.debug('Should NOT appear (below INFO)');
cacheLogger.info('Cache hit for key: user:123');

console.log('\n=== Complete! ===\n');
console.log('Key takeaways:');
console.log('- Configure LOG_RULES.levels at app startup');
console.log('- First match wins (put specific patterns first)');
console.log('- No recompilation needed when you change config');
console.log('- Type-safe and IDE-friendly');
