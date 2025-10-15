/**
 * Demonstration of case-agnostic PII field name matching
 *
 * Shows that PII fields are detected regardless of casing:
 * - USER_ID, UserId, user_id, userId all match
 * - _USER_ID, _UserId, _user_id all match
 * - EMAIL, Email, email, EmAiL all match
 *
 * Run:
 *   LOG_HASH_SECRET=my-secret-key-123 LOG_USE_JSON_FORMAT=true LOG_INFO=true npx ts-node examples/case_agnostic_pii_demo.ts
 */

import { getLogger } from '../src/log/getLogger';
import { isPIISecureModeEnabled } from '../src/log/piiSanitizer';

const logger = getLogger('CaseAgnosticDemo');

console.log('='.repeat(60));
console.log('Case-Agnostic PII Field Name Matching');
console.log('='.repeat(60));
console.log(`PII Secure Mode: ${isPIISecureModeEnabled() ? 'ENABLED' : 'DISABLED'}`);
console.log('='.repeat(60));
console.log();

// Example 1: Various USER_ID casings
console.log('Example 1: USER_ID with different casings');
logger.info('Different userId casings', {
  USER_ID: 'user-123',          // All caps
  UserId: 'user-456',            // Pascal case
  userId: 'user-789',            // Camel case
  user_id: 'user-abc',           // Snake case
  User_Id: 'user-def',           // Mixed
  USERID: 'user-xyz'             // No separators
});
console.log();

// Example 2: USERNAME variations
console.log('Example 2: USERNAME with different casings');
logger.info('Different username casings', {
  USERNAME: 'alice',
  UserName: 'bob',
  username: 'charlie',
  UsERnaME: 'dave',              // Weird casing
  user_name: 'eve'
});
console.log();

// Example 3: EMAIL variations
console.log('Example 3: EMAIL with different casings');
logger.info('Different email casings', {
  EMAIL: 'test1@example.com',
  Email: 'test2@example.com',
  email: 'test3@example.com',
  EmAiL: 'test4@example.com',
  E_MAIL: 'test5@example.com'
});
console.log();

// Example 4: With underscore prefixes
console.log('Example 4: Underscore-prefixed with different casings');
logger.info('Underscore-prefixed fields', {
  _USER_ID: 'user-111',
  _UserId: 'user-222',
  _userId: 'user-333',
  _user_id: 'user-444',
  _User_Id: 'user-555'
});
console.log();

// Example 5: PRINCIPAL_ID variations
console.log('Example 5: PRINCIPAL_ID with different casings');
logger.info('Different principalId casings', {
  PRINCIPAL_ID: 'principal-aaa',
  PrincipalId: 'principal-bbb',
  principalId: 'principal-ccc',
  principal_id: 'principal-ddd',
  Principal_Id: 'principal-eee'
});
console.log();

// Example 6: Mixed PII and non-PII fields
console.log('Example 6: Mix of PII (various casings) and non-PII');
logger.info('Mixed fields', {
  USER_ID: 'user-999',           // PII - will be hashed
  Username: 'testuser',          // PII - will be hashed
  EMAIL: 'test@example.com',     // PII - will be hashed
  requestId: 'req-12345',        // Not PII - kept as-is
  action: 'LOGIN',               // Not PII - kept as-is
  timestamp: new Date().toISOString()  // Not PII - kept as-is
});
console.log();

// Example 7: Nested objects with various casings
console.log('Example 7: Nested objects with case variations');
logger.info('Nested structure', {
  user: {
    USER_ID: 'user-nested-1',
    Email: 'nested@example.com',
    profile: {
      FirstName: 'John',
      LAST_NAME: 'Doe'
    }
  },
  metadata: {
    REQUEST_ID: 'req-nested',    // Not PII
    Timestamp: new Date().toISOString()
  }
});
console.log();

console.log('='.repeat(60));
console.log('Key Observations:');
console.log('='.repeat(60));
console.log('1. All variations are detected as PII regardless of casing');
console.log('2. USER_ID, UserId, userId, user_id all get hashed');
console.log('3. Works with underscore prefixes: _USER_ID, _userId, etc.');
console.log('4. Non-PII fields remain unchanged regardless of casing');
console.log('5. Nested objects are processed recursively');
console.log('6. Original field names preserved in hash key (e.g., USER_ID_hash)');
console.log();
