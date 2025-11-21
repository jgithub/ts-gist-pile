/**
 * Demonstration of the blur() API functions
 *
 * Functions:
 *   plain()           - No obfuscation (alias for d4l)
 *   blur()            - Always obfuscates (alias for d4lObfuscate)
 *   blurIfEnabled()   - Obfuscates only if LOG_HASH_SECRET is set (alias for d4lPii)
 *   blurWhereNeeded() - Smart content scanner, always active (NEW!)
 *
 * Run configurations:
 *
 * 1. Without LOG_HASH_SECRET (development mode):
 *    npx ts-node examples/test_blur_functions.ts
 *
 * 2. With LOG_HASH_SECRET (production mode):
 *    LOG_HASH_SECRET=my-secret-key-123 npx ts-node examples/test_blur_functions.ts
 */

import { plain, blur, blurIfEnabled, blurWhereNeeded, getLogger } from '../src/index';

process.env.LOG_HASH_SECRET = 'a';
process.env.LOG_EAGER_AUTO_SANITIZE = 'true'
console.log('='.repeat(80));
console.log('BLUR FUNCTIONS DEMONSTRATION');
console.log('='.repeat(80));
console.log(`LOG_HASH_SECRET: ${process.env.LOG_HASH_SECRET ? '✓ SET' : '✗ NOT SET'}`);
console.log(`LOG_EAGER_AUTO_SANITIZE: ${process.env.LOG_EAGER_AUTO_SANITIZE ? '✓ SET' : '✗ NOT SET'}`);
console.log('='.repeat(80));
console.log();

const testCases = [
  {
    name: 'Simple email',
    value: 'john@example.com'
  },
  {
    name: 'Email in sentence',
    value: 'My email is john@example.com and you can reach me there'
  },
  {
    name: 'Name',
    value: 'Bob Smith'
  },
  {
    name: 'Name in sentence',
    value: 'Hello my name is Bob Smith'
  },
  {
    name: 'SSN',
    value: '123-45-6789'
  },
  {
    name: 'SSN in text',
    value: 'My SSN is 123-45-6789 for verification'
  },
  {
    name: 'Credit card',
    value: '4532-1234-5678-9012'
  },
  {
    name: 'Credit card in text',
    value: 'Please charge card 4532-1234-5678-9012 for the order'
  },
  {
    name: 'Phone number',
    value: '555-123-4567'
  },
  {
    name: 'Phone in text',
    value: 'Call me at 555-123-4567 or leave a message'
  },
  {
    name: 'Multiple PII types',
    value: 'Contact Bob Smith at bob@example.com or 555-123-4567'
  },
  {
    name: 'Complex message',
    value: 'User John Doe (john@example.com) called from 555-999-8888 about card 4111-1111-1111-1111'
  },
  {
    name: 'IP address',
    value: 'Server at 192.168.1.100'
  },
  {
    name: 'No sensitive data',
    value: 'This is just a normal message with no PII'
  },
  {
    name: 'An object',
    value: [{
      nested: {
        again: {
          credit_card: '4532-1234-5678-9012',
          creditCard: '6789-0123-4567-8901',
          keyIsPrettyNormal: '+15553123456',
          keyIsPrettyNormal2: '1-815-555-1212',
          keyIsPrettyNormal3: 'bob@example.com',
          keyIsPrettyNormal4: 'Looking for a drummer? bob@example.com',
          justABoringKey: 'Nothing to see here',
        }
      }
    }, "bob@example.com was here" ]
  }
];

const LOG = getLogger('BlurFunctionDemo');

testCases.forEach((test, i) => {
  console.log(`\n[${ i + 1}] ${test.name}`);
  console.log(`    Input:             "${test.value}"`);
  console.log(`    plain():           ${plain(test.value)}`);
  console.log(`    blur():            ${blur(test.value)}`);
  console.log(`    blurIfEnabled():   ${blurIfEnabled(test.value)}`);
  console.log(`    blurWhereNeeded(): ${blurWhereNeeded(test.value)}`);
  LOG.notice (`LOG.notice 2nd param:`, test.value as any);
});





console.log('\n' + '='.repeat(80));
console.log('KEY DIFFERENCES:');
console.log('='.repeat(80));
console.log();
console.log('plain()            - No obfuscation, just debug formatting');
console.log('blur()             - ALWAYS obfuscates entire value');
console.log('blurIfEnabled()    - Obfuscates entire value ONLY if LOG_HASH_SECRET is set');
console.log('blurWhereNeeded()  - ALWAYS scans content and redacts only PII patterns');
console.log();
console.log('Performance (fastest → slowest):');
console.log('  1. plain()            ⚡⚡⚡ Fastest');
console.log('  2. blur()             ⚡⚡  Fast');
console.log('  3. blurIfEnabled()    ⚡⚡  Fast');
console.log('  4. blurWhereNeeded()  ⚡   Slowest (content scanning)');
console.log();
console.log('When to use:');
console.log('  plain()            - Non-sensitive data, development');
console.log('  blur()             - Always hide, simple values (IDs, tokens)');
console.log('  blurIfEnabled()    - Environment-based (dev=readable, prod=hidden)');
console.log('  blurWhereNeeded()  - User input, error messages, free-form text');
console.log();
console.log('='.repeat(80));
