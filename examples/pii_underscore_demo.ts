/**
 * Demonstration of PII-secure logging with underscore-prefixed fields
 *
 * Run with PII mode enabled:
 *   LOG_HASH_SECRET=my-secret-key-123 LOG_USE_JSON_FORMAT=true LOG_INFO=true npx ts-node examples/pii_underscore_demo.ts
 */

import { getLogger } from '../src/log/getLogger';
import { isPIISecureModeEnabled } from '../src/log/piiSanitizer';

const logger = getLogger('UnderscoreDemo');

console.log('='.repeat(60));
console.log('PII Logging with Underscore Prefixes');
console.log('='.repeat(60));
console.log(`PII Secure Mode: ${isPIISecureModeEnabled() ? 'ENABLED' : 'DISABLED'}`);
console.log('='.repeat(60));
console.log();

// Example 1: Simple underscore-prefixed fields
console.log('Example 1: Underscore-prefixed PII fields');
logger.info('Processing request', {
  _userId: 'user-12345',
  _email: 'john@example.com',
  _principalId: 'principal-abc',
  requestId: 'req-xyz-789'
});
console.log();

// Example 2: Nested _attrs pattern (common in AWS, Sequelize, etc.)
console.log('Example 2: Nested _attrs with PII');
logger.info('User record accessed', {
  _attrs: {
    _userId: 'user-67890',
    _email: 'jane@example.com',
    _phone: '555-123-4567',
    status: 'active',
    createdAt: '2024-01-01'
  },
  action: 'read',
  timestamp: new Date().toISOString()
});
console.log();

// Example 3: Mix of underscored and non-underscored
console.log('Example 3: Mixed format PII fields');
logger.info('Authentication event', {
  userId: 'user-11111',           // without underscore
  _email: 'mixed@example.com',     // with underscore
  principalId: 'principal-def',    // without underscore
  _emailSanitized: 'sanitized@example.com',  // with underscore
  ipAddress: '10.0.0.1',          // without underscore
  _phone: '555-999-8888',         // with underscore
  eventType: 'login'              // not PII
});
console.log();

// Example 4: Deep nested structure
console.log('Example 4: Deeply nested structure');
logger.info('Complex data structure', {
  transaction: {
    id: 'txn-12345',
    user: {
      _attrs: {
        _userId: 'user-99999',
        _email: 'deep@example.com',
        _firstName: 'Deep',
        _lastName: 'Nested'
      },
      preferences: {
        theme: 'dark',
        notifications: true
      }
    },
    metadata: {
      _principalId: 'principal-ghi',
      amount: 150.00,
      currency: 'USD'
    }
  }
});
console.log();

// Example 5: Array with underscore fields
console.log('Example 5: Array of items with underscore PII');
logger.info('Batch operation', {
  items: [
    { _userId: 'user-1', _email: 'user1@example.com', status: 'processed' },
    { _userId: 'user-2', _email: 'user2@example.com', status: 'pending' },
    { _userId: 'user-3', _email: 'user3@example.com', status: 'failed' }
  ],
  batchId: 'batch-abc-123'
});
console.log();

console.log('='.repeat(60));
console.log('Demonstration Complete');
console.log('='.repeat(60));
console.log();
console.log('Key Features Demonstrated:');
console.log('- Fields with underscore prefix (_userId, _email) are detected as PII');
console.log('- Nested structures like { _attrs: { _userId } } work correctly');
console.log('- Mix of _field and field formats both get hashed');
console.log('- principalId and emailSanitized fields are now supported');
console.log('- Arrays with PII fields are sanitized recursively');
console.log('- Non-PII fields remain untouched');
console.log();
