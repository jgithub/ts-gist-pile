/**
 * Demonstration of LOG_EAGER_AUTO_SANITIZE feature
 *
 * This feature automatically detects and redacts sensitive PII/HIPAA/GDPR fields
 * without requiring LOG_HASH_SECRET to be set.
 *
 * Run without eager sanitization (PII visible):
 *   npx ts-node examples/eager_auto_sanitize_demo.ts
 *
 * Run with eager sanitization enabled (PII redacted):
 *   LOG_EAGER_AUTO_SANITIZE=true npx ts-node examples/eager_auto_sanitize_demo.ts
 *
 * Run with JSON format for better readability:
 *   LOG_EAGER_AUTO_SANITIZE=true LOG_USE_JSON_FORMAT=true npx ts-node examples/eager_auto_sanitize_demo.ts
 */

import { getLogger, d4l } from '../src/index';
import { isEagerAutoSanitizeEnabled } from '../src/env/environmentUtil';

const logger = getLogger('EagerSanitize-Demo');

console.log('='.repeat(70));
console.log('LOG_EAGER_AUTO_SANITIZE Demonstration');
console.log('='.repeat(70));
console.log(`Eager Auto-Sanitization: ${isEagerAutoSanitizeEnabled() ? 'ENABLED ✓' : 'DISABLED ✗'}`);
console.log('='.repeat(70));
console.log();

// Example 1: Simple password field (from user's request)
console.log('Example 1: Simple Password Field');
const a = { password: 'neverguessme' };
logger.info('User data', a);
console.log(`Using d4l: LOG.info(\`User data \${d4l(a)}\`) =>`, d4l(a));
console.log();

// Example 2: Nested SSN (from user's request)
console.log('Example 2: Nested SSN');
const b = { nested: { ssn: '111-22-5555' } };
logger.info('User data', b);
console.log(`Using d4l: LOG.info(\`User data \${d4l(b)}\`) =>`, d4l(b));
console.log();

// Example 3: Double nested email (from user's request)
console.log('Example 3: Double Nested Email');
const c = { double: { nested: { email: 'john@smith.com' } } };
logger.info('User data', c);
console.log(`Using d4l: LOG.info(\`User data \${d4l(c)}\`) =>`, d4l(c));
console.log();

// Example 4: Email with underscore (from user's request)
console.log('Example 4: Email with Underscore (e_mail)');
const d = { double: { nested: { e_mail: 'john@smith.com' } } };
logger.info('User data', d);
console.log(`Using d4l: LOG.info(\`User data \${d4l(d)}\`) =>`, d4l(d));
console.log();

// Example 5: Email with camelCase (from user's request)
console.log('Example 5: Email with camelCase (eMail)');
const e = { double: { nested: { eMail: 'john@smith.com' } } };
logger.info('User data', e);
console.log(`Using d4l: LOG.info(\`User data \${d4l(e)}\`) =>`, d4l(e));
console.log();

// Example 6: Email with hyphen (from user's request)
console.log('Example 6: Email with Hyphen (e-mail)');
const f = { double: { nested: { 'e-mail': 'john@smith.com' } } };
logger.info('User data', f);
console.log(`Using d4l: LOG.info(\`User data \${d4l(f)}\`) =>`, d4l(f));
console.log();

// Example 7: User authentication data
console.log('Example 7: User Authentication Data');
logger.info('Login attempt', {
  username: 'john.doe',
  password: 'super-secret-password',
  email: 'john.doe@example.com',
  ipAddress: '192.168.1.100',
  timestamp: new Date().toISOString()
});
console.log();

// Example 8: Financial information
console.log('Example 8: Financial Information (GDPR/PCI)');
logger.info('Payment processing', {
  userId: 'user-12345',
  creditCard: '4532-1234-5678-9012',
  cvv: '123',
  cardNumber: '4532123456789012',
  accountNumber: '9876543210',
  routingNumber: '123456789'
});
console.log();

// Example 9: Medical information (HIPAA)
console.log('Example 9: Medical Information (HIPAA)');
logger.info('Patient record', {
  patient: {
    name: 'John Smith',
    ssn: '123-45-6789',
    dob: '1990-01-15',
    medicalRecordNumber: 'MRN-123456',
    insuranceNumber: 'INS-789012'
  },
  diagnosis: 'Routine checkup'
});
console.log();

// Example 10: Multiple levels of nesting
console.log('Example 10: Deep Nesting (5 levels)');
const deeplyNested = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            email: 'deep@example.com',
            password: 'hidden',
            name: 'John Doe',
            safe: 'visible'
          }
        }
      }
    }
  }
};
logger.info('Deeply nested data', deeplyNested);
console.log(`Using d4l: =>`, d4l(deeplyNested));
console.log();

// Example 11: Arrays of objects with PII
console.log('Example 11: Arrays of Objects with PII');
logger.info('Multiple users', {
  users: [
    { userId: 'user1', email: 'user1@example.com', name: 'Alice' },
    { userId: 'user2', email: 'user2@example.com', name: 'Bob' },
    { userId: 'user3', email: 'user3@example.com', name: 'Charlie' }
  ]
});
console.log();

// Example 12: Mixed sensitive and non-sensitive fields
console.log('Example 12: Mixed Sensitive and Non-Sensitive Fields');
logger.info('User profile', {
  // These will be redacted
  userId: 'user-789',
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '555-1234',
  address: '123 Main St',
  ssn: '987-65-4321',

  // These will remain visible
  accountType: 'premium',
  subscriptionStatus: 'active',
  lastLoginAt: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    language: 'en-US'
  }
});
console.log();

// Example 13: API keys and tokens
console.log('Example 13: API Keys and Tokens');
logger.info('API request', {
  apiKey: 'sk_live_1234567890abcdef',
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'rt_1234567890',
  secret: 'my-secret-key',
  endpoint: '/api/v1/users',
  method: 'GET'
});
console.log();

// Example 14: Location data (GDPR)
console.log('Example 14: Location Data (GDPR)');
logger.info('Location tracking', {
  userId: 'user-456',
  location: {
    street: '456 Oak Avenue',
    city: 'Boston',
    state: 'MA',
    zipCode: '02101',
    country: 'USA',
    latitude: 42.3601,
    longitude: -71.0589
  },
  timestamp: new Date().toISOString()
});
console.log();

// Example 15: Email variations
console.log('Example 15: All Email Variations');
logger.info('Email variations', {
  email: 'test1@example.com',
  e_mail: 'test2@example.com',
  'e-mail': 'test3@example.com',
  eMail: 'test4@example.com',
  Email: 'test5@example.com',
  emailAddress: 'test6@example.com',
  email_address: 'test7@example.com',
  emailNormalized: 'test8@example.com',
  email_normalized: 'test9@example.com',
  emailSanitized: 'test10@example.com'
});
console.log();

console.log('='.repeat(70));
console.log('Demonstration Complete');
console.log('='.repeat(70));
console.log();
console.log('Summary:');
console.log('✓ Automatically detects and redacts PII/HIPAA/GDPR sensitive fields');
console.log('✓ Works with unlimited levels of nesting');
console.log('✓ Handles arrays of objects');
console.log('✓ Supports multiple field name variations (camelCase, snake_case, hyphen-case)');
console.log('✓ Works in both LOG.info() context objects and d4l() template tags');
console.log('✓ No LOG_HASH_SECRET required (opt-in with LOG_EAGER_AUTO_SANITIZE=true)');
console.log('✓ Non-sensitive fields remain visible for debugging');
console.log();
console.log('Detected Field Types:');
console.log('  • User Identifiers: userId, username, principalId, uid, login');
console.log('  • Email: email, e_mail, e-mail, eMail, emailAddress, emailNormalized');
console.log('  • Names: name, firstName, lastName, fullName, middleName');
console.log('  • Contact: phone, mobile, telephone, cellPhone');
console.log('  • Identifiers: ssn, dob, passport, driversLicense');
console.log('  • Financial: creditCard, cvv, accountNumber, routingNumber, cardNumber');
console.log('  • Location: address, street, city, zip, country, ip, latitude, longitude');
console.log('  • Auth: password, secret, apiKey, token, accessToken, refreshToken');
console.log('  • Medical: medicalRecordNumber, insuranceNumber, healthInsurance');
console.log();
