/**
 * Demonstration of d4lPii() for PII-secure logging
 *
 * Run without PII mode (shows actual values):
 *   npx ts-node examples/d4lPii_demo.ts
 *
 * Run with PII mode enabled (hashes values):
 *   LOG_HASH_SECRET=my-secret-key-123 npx ts-node examples/d4lPii_demo.ts
 */

import { d4l, d4lPii } from '../src/index';
import { isPIISecureModeEnabled } from '../src/log/piiSanitizer';

console.log('='.repeat(60));
console.log('d4lPii() Demonstration');
console.log('='.repeat(60));
console.log(`PII Secure Mode: ${isPIISecureModeEnabled() ? 'ENABLED' : 'DISABLED'}`);
console.log('='.repeat(60));
console.log();

// Example 1: String values
console.log('Example 1: Logging String Values');
const userId = 'user-12345';
const email = 'john.doe@example.com';

console.log(`  d4l(userId):    ${d4l(userId)}`);
console.log(`  d4lPii(userId): ${d4lPii(userId)}`);
console.log();
console.log(`  d4l(email):     ${d4l(email)}`);
console.log(`  d4lPii(email):  ${d4lPii(email)}`);
console.log();

// Example 2: Number values
console.log('Example 2: Logging Number Values');
const accountNumber = 1234567890;
const amount = 99.99;

console.log(`  d4l(accountNumber):    ${d4l(accountNumber)}`);
console.log(`  d4lPii(accountNumber): ${d4lPii(accountNumber)}`);
console.log();
console.log(`  d4l(amount):    ${d4l(amount)}`);
console.log(`  d4lPii(amount): ${d4lPii(amount)}`);
console.log();

// Example 3: Object values
console.log('Example 3: Logging Object Values');
const userObj = { userId: 'user-99999', name: 'Jane Smith' };

console.log(`  d4l(userObj):    ${d4l(userObj)}`);
console.log(`  d4lPii(userObj): ${d4lPii(userObj)}`);
console.log();

// Example 4: Using in log messages
console.log('Example 4: Using d4lPii in Log Messages');
const principalId = 'principal-abc-123';
const ipAddress = '192.168.1.100';

const logMessage1 = `User authentication: principalId=${d4lPii(principalId)}, ip=${d4lPii(ipAddress)}`;
const logMessage2 = `Transaction: userId=${d4lPii(userId)}, amount=${d4l(amount)}`;

console.log(`  ${logMessage1}`);
console.log(`  ${logMessage2}`);
console.log();

// Example 5: Comparing d4l vs d4lPii
console.log('Example 5: Side-by-side Comparison');
const ssn = '123-45-6789';
const phone = '555-123-4567';

console.log('  Regular d4l (always shows value):');
console.log(`    SSN:   ${d4l(ssn)}`);
console.log(`    Phone: ${d4l(phone)}`);
console.log();
console.log('  d4lPii (hashes when LOG_HASH_SECRET is set):');
console.log(`    SSN:   ${d4lPii(ssn)}`);
console.log(`    Phone: ${d4lPii(phone)}`);
console.log();

// Example 6: Consistency of hashing
if (isPIISecureModeEnabled()) {
  console.log('Example 6: Hash Consistency');
  const testValue = 'test-value-123';
  const hash1 = d4lPii(testValue);
  const hash2 = d4lPii(testValue);

  console.log(`  First hash:  ${hash1}`);
  console.log(`  Second hash: ${hash2}`);
  console.log(`  Are they equal? ${hash1 === hash2 ? 'YES' : 'NO'}`);
  console.log();
}

console.log('='.repeat(60));
console.log('Key Points:');
console.log('='.repeat(60));
console.log('1. Without LOG_HASH_SECRET: d4lPii() behaves exactly like d4l()');
console.log('2. With LOG_HASH_SECRET: d4lPii() returns a 12-character hash');
console.log('3. Hashes are consistent (same input = same hash)');
console.log('4. Hashes are irreversible (cannot recover original value)');
console.log('5. Use d4lPii() for PII values, use d4l() for non-PII values');
console.log();
console.log('Usage in code:');
console.log('  logger.info(`User ${d4lPii(userId)} performed action ${d4l(action)}`)');
console.log();
