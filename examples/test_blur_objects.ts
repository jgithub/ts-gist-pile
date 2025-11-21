/**
 * Test blur functions with objects (not just strings)
 */

import { plain, blur, blurIfEnabled, blurWhereNeeded } from '../src/index';

console.log('='.repeat(80));
console.log('BLUR FUNCTIONS WITH OBJECTS');
console.log('='.repeat(80));
console.log(`LOG_HASH_SECRET: ${process.env.LOG_HASH_SECRET ? '✓ SET' : '✗ NOT SET'}`);
console.log('='.repeat(80));
console.log();

const testObject = {
  nested: {
    again: {
      credit_card: "4532-1234-5678-9012",
      creditCard: "6789-0123-4567-8901",
      keyIsPrettyNormal: "+15553123456",
      keyIsPrettyNormal2: "1-815-555-1212",
      keyIsPrettyNormal3: "bob@example.com",
      keyIsPrettyNormal4: "Looking for a drummer? bob@example.com"
    }
  }
};

console.log('Test Object:');
console.log(JSON.stringify(testObject, null, 2));
console.log();
console.log('='.repeat(80));
console.log();

console.log('plain(obj):');
console.log(plain(testObject));
console.log();

console.log('blur(obj):');
console.log(blur(testObject));
console.log();

console.log('blurIfEnabled(obj):');
console.log(blurIfEnabled(testObject));
console.log();

console.log('blurWhereNeeded(obj):');
console.log(blurWhereNeeded(testObject));
console.log();

console.log('='.repeat(80));
console.log('EXPECTED BEHAVIOR:');
console.log('='.repeat(80));
console.log();
console.log('plain():          Shows everything (no protection)');
console.log('blur():           Obfuscates based on FIELD NAMES (credit_card, creditCard)');
console.log('blurIfEnabled():  Obfuscates if LOG_HASH_SECRET is set (field name-based)');
console.log('blurWhereNeeded(): Scans VALUES for patterns (emails, phones, cards)');
console.log();
console.log('Note: blur() and blurIfEnabled() use field name detection');
console.log('      blurWhereNeeded() uses content pattern detection');
console.log();
