/**
 * Demonstration of PII-secure logging
 *
 * Run without PII mode:
 *   npx ts-node examples/pii_logging_demo.ts
 *
 * Run with PII mode enabled:
 *   LOG_HASH_SECRET=my-secret-key-123 LOG_USE_JSON_FORMAT=true npx ts-node examples/pii_logging_demo.ts
 */

import { getLogger } from '../src/log/getLogger';
import { isPIISecureModeEnabled } from '../src/log/piiSanitizer';

const logger = getLogger('PII-Demo');

console.log('='.repeat(60));
console.log('PII Logging Demonstration');
console.log('='.repeat(60));
console.log(`PII Secure Mode: ${isPIISecureModeEnabled() ? 'ENABLED' : 'DISABLED'}`);
console.log('='.repeat(60));
console.log();

// Example 1: User login event
console.log('Example 1: User Login Event');
logger.info('User logged in', {
  userId: 'user-12345',
  email: 'john.doe@example.com',
  ipAddress: '192.168.1.100',
  timestamp: new Date().toISOString()
});
console.log();

// Example 2: User registration
console.log('Example 2: User Registration');
logger.info('New user registered', {
  userId: 'user-67890',
  email: 'jane.smith@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '555-123-4567',
  registrationSource: 'web'
});
console.log();

// Example 3: Transaction event
console.log('Example 3: Transaction Event');
logger.info('Transaction completed', {
  transactionId: 'txn-abc123',
  userId: 'user-12345',
  amount: 99.99,
  currency: 'USD',
  creditCard: '4532-1234-5678-9012',
  status: 'completed'
});
console.log();

// Example 4: Nested user profile
console.log('Example 4: Nested User Profile');
logger.info('Profile updated', {
  userId: 'user-12345',
  profile: {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'Springfield',
    preferences: {
      notifications: true,
      theme: 'dark'
    }
  },
  updatedAt: new Date().toISOString()
});
console.log();

// Example 5: Error with PII
console.log('Example 5: Error Event with PII');
logger.error('Failed to process payment', {
  userId: 'user-99999',
  email: 'error@example.com',
  errorCode: 'PAYMENT_DECLINED',
  errorMessage: 'Insufficient funds',
  attemptCount: 3
});
console.log();

console.log('='.repeat(60));
console.log('Demonstration Complete');
console.log('='.repeat(60));
console.log();
console.log('Notes:');
console.log('- Without LOG_HASH_SECRET: PII fields are logged as-is');
console.log('- With LOG_HASH_SECRET: PII fields are replaced with _hash versions');
console.log('- Hashes are consistent (same input = same hash)');
console.log('- Hashes are irreversible (cannot recover original value)');
console.log('- Works in Node.js, gracefully degrades in browsers');
console.log();
