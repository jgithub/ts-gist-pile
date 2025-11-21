/**
 * Comprehensive Logging Demonstration
 *
 * This demo showcases ~100 different objects logged with various methods and configurations.
 *
 * Logging Methods Demonstrated:
 *   - d4l(): General debug logging
 *   - d4lObfuscate(): Obfuscated logging
 *   - d4lPii(): PII-aware logging
 *
 * Configuration Options:
 *
 * 1. Basic (no sanitization):
 *    npx ts-node examples/comprehensive_logging_demo.ts
 *
 * 2. With LOG_EAGER_AUTO_SANITIZE enabled:
 *    LOG_EAGER_AUTO_SANITIZE=true npx ts-node examples/comprehensive_logging_demo.ts
 *
 * 3. With LOG_HASH_SECRET set:
 *    LOG_HASH_SECRET=my-secret-key-123 npx ts-node examples/comprehensive_logging_demo.ts
 *
 * 4. With both LOG_EAGER_AUTO_SANITIZE and LOG_HASH_SECRET:
 *    LOG_EAGER_AUTO_SANITIZE=true LOG_HASH_SECRET=my-secret-key-123 npx ts-node examples/comprehensive_logging_demo.ts
 *
 * 5. With JSON format for better readability:
 *    LOG_USE_JSON_FORMAT=true LOG_EAGER_AUTO_SANITIZE=true npx ts-node examples/comprehensive_logging_demo.ts
 *
 * 6. All options combined:
 *    LOG_USE_JSON_FORMAT=true LOG_EAGER_AUTO_SANITIZE=true LOG_HASH_SECRET=my-secret-key-123 LOG_INFO=true npx ts-node examples/comprehensive_logging_demo.ts
 */

import { getLogger, d4l, d4lObfuscate, d4lPii, blurWhereNeeded } from '../src/index';
import { isEagerAutoSanitizeEnabled } from '../src/env/environmentUtil';

const logger = getLogger('ComprehensiveDemo');
const LOG = logger; // Alias for shorter syntax

// Helper to show section headers
function section(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80));
}

// Helper to log an object with all variations
function logWithAllMethods(description: string, obj: any, index: number) {
  console.log(`\n[${index}] ${description}`);

  // Pattern 1: Pass object as context parameter
  console.log('  Pattern 1: logger.info(msg, obj)');
  logger.info(`  ${description}`, obj);

  // Pattern 2: Use d4l() inline in template string
  console.log('  Pattern 2: logger.info(`msg ${d4l(obj)}`)');
  logger.info(`  ${description} = ${d4l(obj)}`);

  // Pattern 3: Use d4lObfuscate() inline in template string
  console.log('  Pattern 3: logger.info(`msg ${d4lObfuscate(obj)}`)');
  logger.info(`  ${description} = ${d4lObfuscate(obj)}`);

  // Pattern 4: Use d4lPii() inline in template string
  console.log('  Pattern 4: logger.info(`msg ${d4lPii(obj)}`)');
  logger.info(`  ${description} = ${d4lPii(obj)}`);

  // Pattern 5: Mixed - wrap in object
  console.log('  Pattern 5: logger.info(msg, { wrapped: d4l(obj) })');
  logger.info(`  ${description}`, { wrapped: d4l(obj) });

  // Pattern 6: Multiple parameters with different methods
  console.log('  Pattern 6: logger.info(msg, { d4l, d4lPii, raw })');
  logger.info(`  ${description}`, {
    usingD4l: d4l(obj),
    usingD4lPii: d4lPii(obj),
    rawObject: obj
  });
}

// Display configuration
console.log('\n' + '█'.repeat(80));
console.log('█' + ' '.repeat(78) + '█');
console.log('█' + '  COMPREHENSIVE LOGGING DEMONSTRATION'.padEnd(78) + '█');
console.log('█' + ' '.repeat(78) + '█');
console.log('█'.repeat(80));
console.log();
console.log('Configuration:');
console.log(`  LOG_EAGER_AUTO_SANITIZE: ${isEagerAutoSanitizeEnabled() ? '✓ ENABLED' : '✗ DISABLED'}`);
console.log(`  LOG_HASH_SECRET:         ${process.env.LOG_HASH_SECRET ? '✓ SET' : '✗ NOT SET'}`);
console.log(`  LOG_USE_JSON_FORMAT:     ${process.env.LOG_USE_JSON_FORMAT ? '✓ ENABLED' : '✗ DISABLED'}`);
console.log(`  LOG_INFO:                ${process.env.LOG_INFO ? '✓ ENABLED' : '✗ DISABLED'}`);

let objectCounter = 0;

// ============================================================================
// USER IDENTITY & AUTHENTICATION DATA (Objects 1-20)
// ============================================================================
section('USER IDENTITY & AUTHENTICATION DATA (Objects 1-20)');

logWithAllMethods('Simple password',
  { password: 'neverguessme' }, ++objectCounter);

logWithAllMethods('User credentials',
  { username: 'john.doe', password: 'super-secret-123' }, ++objectCounter);

logWithAllMethods('Login attempt',
  { username: 'alice', password: 'p@ssw0rd', ipAddress: '192.168.1.100' }, ++objectCounter);

logWithAllMethods('Email and password',
  { email: 'user@example.com', password: 'secret123' }, ++objectCounter);

logWithAllMethods('Multiple email variations',
  { email: 'test1@example.com', e_mail: 'test2@example.com', 'e-mail': 'test3@example.com' }, ++objectCounter);

logWithAllMethods('Email camelCase variations',
  { eMail: 'test4@example.com', Email: 'test5@example.com', emailAddress: 'test6@example.com' }, ++objectCounter);

logWithAllMethods('User profile with name',
  { userId: 'user-123', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }, ++objectCounter);

logWithAllMethods('Full name variations',
  { fullName: 'Jane Smith', name: 'Jane Smith', displayName: 'JaneS' }, ++objectCounter);

logWithAllMethods('Middle name',
  { firstName: 'Robert', middleName: 'James', lastName: 'Johnson' }, ++objectCounter);

logWithAllMethods('Username variations',
  { username: 'bob123', userName: 'bob123', user_name: 'bob123' }, ++objectCounter);

logWithAllMethods('Principal ID and UID',
  { principalId: 'principal-789', uid: 'uid-456', login: 'loginUser' }, ++objectCounter);

logWithAllMethods('API keys',
  { apiKey: 'sk_live_1234567890abcdef', api_key: 'pk_test_xyz' }, ++objectCounter);

logWithAllMethods('Access tokens',
  { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', access_token: 'at_12345' }, ++objectCounter);

logWithAllMethods('Refresh tokens',
  { refreshToken: 'rt_1234567890', refresh_token: 'rt_abcdef' }, ++objectCounter);

logWithAllMethods('Bearer token',
  { token: 'Bearer abc123xyz', bearerToken: 'xyz789' }, ++objectCounter);

logWithAllMethods('Secret and private key',
  { secret: 'my-secret-key', privateKey: 'PRIVATE-KEY-DATA', secretKey: 'sk_123' }, ++objectCounter);

logWithAllMethods('OAuth data',
  { clientId: 'client-123', clientSecret: 'cs_secret_456', redirectUri: 'https://example.com/callback' }, ++objectCounter);

logWithAllMethods('Session data',
  { sessionId: 'sess-789', sessionToken: 'st_token_xyz', userId: 'user-456' }, ++objectCounter);

logWithAllMethods('Authentication headers',
  { authorization: 'Bearer token123', 'x-api-key': 'api_key_456' }, ++objectCounter);

logWithAllMethods('Two-factor auth',
  { userId: 'user-123', totpSecret: 'JBSWY3DPEHPK3PXP', backupCodes: ['code1', 'code2'] }, ++objectCounter);

// ============================================================================
// CONTACT INFORMATION (Objects 21-35)
// ============================================================================
section('CONTACT INFORMATION (Objects 21-35)');

logWithAllMethods('Phone number',
  { phone: '555-1234', phoneNumber: '555-5678' }, ++objectCounter);

logWithAllMethods('Mobile numbers',
  { mobile: '555-9999', mobilePhone: '555-8888', cellPhone: '555-7777' }, ++objectCounter);

logWithAllMethods('Telephone variations',
  { telephone: '555-6666', tel: '555-5555', phoneNum: '555-4444' }, ++objectCounter);

logWithAllMethods('International phone',
  { phone: '+1-555-123-4567', countryCode: '+1', areaCode: '555' }, ++objectCounter);

logWithAllMethods('Contact info',
  { name: 'Alice Brown', email: 'alice@example.com', phone: '555-0001' }, ++objectCounter);

logWithAllMethods('Emergency contact',
  { emergencyContact: 'Bob Smith', emergencyPhone: '555-0002', relationship: 'spouse' }, ++objectCounter);

logWithAllMethods('Business contact',
  { companyName: 'Acme Corp', contactPerson: 'Charlie Davis', businessPhone: '555-0003' }, ++objectCounter);

logWithAllMethods('Fax and landline',
  { fax: '555-0004', landline: '555-0005', homePhone: '555-0006' }, ++objectCounter);

logWithAllMethods('Work and personal phone',
  { workPhone: '555-0007', personalPhone: '555-0008', ext: '1234' }, ++objectCounter);

logWithAllMethods('Contact with address',
  { email: 'contact@example.com', phone: '555-0009', address: '123 Main St' }, ++objectCounter);

logWithAllMethods('Social media contacts',
  { twitter: '@johndoe', linkedin: 'linkedin.com/in/johndoe', github: 'github.com/johndoe' }, ++objectCounter);

logWithAllMethods('Website and blog',
  { website: 'https://example.com', blog: 'https://blog.example.com', portfolio: 'https://portfolio.example.com' }, ++objectCounter);

logWithAllMethods('Skype and messenger',
  { skype: 'john.skype', telegram: '@john_telegram', whatsapp: '555-0010' }, ++objectCounter);

logWithAllMethods('Slack and Discord',
  { slack: '@john_slack', discord: 'john#1234', teams: 'john@teams' }, ++objectCounter);

logWithAllMethods('Multiple contact methods',
  { preferredContact: 'email', email: 'prefer@example.com', phone: '555-0011', sms: '555-0012' }, ++objectCounter);

// ============================================================================
// PERSONAL IDENTIFIERS (Objects 36-50)
// ============================================================================
section('PERSONAL IDENTIFIERS (Objects 36-50)');

logWithAllMethods('SSN',
  { ssn: '123-45-6789', socialSecurityNumber: '987-65-4321' }, ++objectCounter);

logWithAllMethods('Date of birth',
  { dob: '1990-01-15', dateOfBirth: '1985-06-20', birthDate: '1992-12-25' }, ++objectCounter);

logWithAllMethods('Passport',
  { passport: 'P1234567', passportNumber: 'AB1234567', passportCountry: 'USA' }, ++objectCounter);

logWithAllMethods('Drivers license',
  { driversLicense: 'D1234567', driverLicenseNumber: 'DL-987654', dlState: 'CA' }, ++objectCounter);

logWithAllMethods('National ID',
  { nationalId: 'NID-123456', idNumber: 'ID-789012', governmentId: 'GID-345678' }, ++objectCounter);

logWithAllMethods('Tax ID',
  { taxId: 'TAX-123456', ein: '12-3456789', vatNumber: 'VAT-987654' }, ++objectCounter);

logWithAllMethods('Citizen number',
  { citizenNumber: 'CN-123456', citizenId: 'CID-789012', nationality: 'US' }, ++objectCounter);

logWithAllMethods('Voter ID',
  { voterId: 'VID-123456', voterRegistration: 'VR-789012' }, ++objectCounter);

logWithAllMethods('Immigration status',
  { visaNumber: 'VISA-123456', greenCard: 'GC-789012', alienNumber: 'A-123456789' }, ++objectCounter);

logWithAllMethods('Student ID',
  { studentId: 'STU-123456', studentNumber: 'S-789012', enrollmentId: 'ENR-345678' }, ++objectCounter);

logWithAllMethods('Employee ID',
  { employeeId: 'EMP-123456', employeeNumber: 'E-789012', badgeNumber: 'B-345678' }, ++objectCounter);

logWithAllMethods('Member ID',
  { memberId: 'MEM-123456', membershipNumber: 'M-789012', loyaltyId: 'LOY-345678' }, ++objectCounter);

logWithAllMethods('Patient identifiers',
  { patientId: 'PAT-123456', medicalRecordNumber: 'MRN-789012', chartNumber: 'CH-345678' }, ++objectCounter);

logWithAllMethods('Insurance numbers',
  { insuranceNumber: 'INS-123456', policyNumber: 'POL-789012', groupNumber: 'GRP-345678' }, ++objectCounter);

logWithAllMethods('Multiple IDs',
  { ssn: '111-22-3333', passport: 'P9876543', driversLicense: 'DL-111222', nationalId: 'NID-999888' }, ++objectCounter);

// ============================================================================
// FINANCIAL DATA (Objects 51-65)
// ============================================================================
section('FINANCIAL DATA (Objects 51-65)');

logWithAllMethods('Credit card',
  { creditCard: '4532-1234-5678-9012', cvv: '123', expiryDate: '12/25' }, ++objectCounter);

logWithAllMethods('Card number variations',
  { cardNumber: '4532123456789012', card_number: '5555444433332222', ccNumber: '6011123456789012' }, ++objectCounter);

logWithAllMethods('Debit card',
  { debitCard: '4111111111111111', debitCardNumber: '4222222222222222', pin: '1234' }, ++objectCounter);

logWithAllMethods('CVV variations',
  { cvv: '456', cvv2: '789', cvc: '012', securityCode: '345' }, ++objectCounter);

logWithAllMethods('Bank account',
  { accountNumber: '9876543210', routingNumber: '123456789', bankName: 'First Bank' }, ++objectCounter);

logWithAllMethods('IBAN and SWIFT',
  { iban: 'GB82WEST12345698765432', swiftCode: 'DEUTDEFF', bic: 'CHASUS33' }, ++objectCounter);

logWithAllMethods('Payment method',
  { paymentMethod: 'credit_card', last4: '9012', brand: 'visa', cardholderName: 'John Doe' }, ++objectCounter);

logWithAllMethods('Billing address',
  { billingAddress: '456 Oak Ave', billingCity: 'Boston', billingZip: '02101', billingCountry: 'USA' }, ++objectCounter);

logWithAllMethods('Transaction data',
  { transactionId: 'TXN-123456', amount: 99.99, currency: 'USD', cardNumber: '4532123456789012' }, ++objectCounter);

logWithAllMethods('Crypto wallet',
  { walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', privateKey: 'PRIVATE_KEY_DATA' }, ++objectCounter);

logWithAllMethods('Bitcoin address',
  { btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', ethAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }, ++objectCounter);

logWithAllMethods('Bank details',
  { accountHolder: 'Jane Smith', accountNumber: '1111222233', sortCode: '12-34-56' }, ++objectCounter);

logWithAllMethods('Wire transfer',
  { wireTransferId: 'WIRE-123456', beneficiaryAccount: '9999888877', beneficiaryName: 'Bob Johnson' }, ++objectCounter);

logWithAllMethods('Payment gateway',
  { stripeCustomerId: 'cus_123456', paypalEmail: 'payment@example.com', squareId: 'sq_123456' }, ++objectCounter);

logWithAllMethods('Financial summary',
  { totalBalance: 10000.00, accountNumber: '5555666677', creditLimit: 5000.00, availableCredit: 4500.00 }, ++objectCounter);

// ============================================================================
// LOCATION DATA (Objects 66-75)
// ============================================================================
section('LOCATION DATA (Objects 66-75)');

logWithAllMethods('Street address',
  { address: '123 Main St', street: '456 Oak Ave', streetAddress: '789 Elm Dr' }, ++objectCounter);

logWithAllMethods('City and state',
  { city: 'Boston', state: 'MA', province: 'Ontario', region: 'Northeast' }, ++objectCounter);

logWithAllMethods('ZIP and postal code',
  { zipCode: '02101', zip: '90210', postalCode: 'M5H 2N2', postcode: 'SW1A 1AA' }, ++objectCounter);

logWithAllMethods('Country',
  { country: 'USA', countryCode: 'US', countryName: 'United States' }, ++objectCounter);

logWithAllMethods('Full address',
  { street: '123 Main St', city: 'Boston', state: 'MA', zipCode: '02101', country: 'USA' }, ++objectCounter);

logWithAllMethods('Coordinates',
  { latitude: 42.3601, longitude: -71.0589, lat: 40.7128, lon: -74.0060 }, ++objectCounter);

logWithAllMethods('GPS location',
  { gpsLat: 37.7749, gpsLon: -122.4194, altitude: 15.5, accuracy: 10 }, ++objectCounter);

logWithAllMethods('IP address',
  { ipAddress: '192.168.1.100', ip: '10.0.0.1', publicIp: '203.0.113.42' }, ++objectCounter);

logWithAllMethods('IPv6 and MAC',
  { ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', macAddress: '00:1B:44:11:3A:B7' }, ++objectCounter);

logWithAllMethods('Location with timestamp',
  { latitude: 51.5074, longitude: -0.1278, timestamp: new Date().toISOString(), city: 'London' }, ++objectCounter);

// ============================================================================
// MEDICAL DATA (Objects 76-85)
// ============================================================================
section('MEDICAL DATA (HIPAA) (Objects 76-85)');

logWithAllMethods('Medical record',
  { medicalRecordNumber: 'MRN-123456', patientId: 'PAT-789012', chartNumber: 'CH-345678' }, ++objectCounter);

logWithAllMethods('Health insurance',
  { insuranceNumber: 'INS-123456', healthInsurance: 'HI-789012', policyNumber: 'POL-345678' }, ++objectCounter);

logWithAllMethods('Prescription',
  { prescriptionNumber: 'RX-123456', medication: 'Medicine Name', dosage: '10mg', patientId: 'PAT-111' }, ++objectCounter);

logWithAllMethods('Lab results',
  { labOrderNumber: 'LAB-123456', testResult: 'Normal', patientName: 'John Smith' }, ++objectCounter);

logWithAllMethods('Diagnosis',
  { diagnosisCode: 'ICD-123', diagnosis: 'Condition name', patientId: 'PAT-222' }, ++objectCounter);

logWithAllMethods('Treatment plan',
  { treatmentId: 'TRT-123456', procedure: 'Procedure name', patientMRN: 'MRN-333' }, ++objectCounter);

logWithAllMethods('Healthcare provider',
  { providerId: 'PROV-123456', npiNumber: 'NPI-789012', licenseNumber: 'LIC-345678' }, ++objectCounter);

logWithAllMethods('Patient demographics',
  { patientName: 'Jane Doe', dob: '1980-05-15', ssn: '444-55-6666', medicalRecordNumber: 'MRN-444' }, ++objectCounter);

logWithAllMethods('Immunization record',
  { vaccineType: 'Vaccine Name', lotNumber: 'LOT-123456', patientId: 'PAT-555', administeredDate: '2024-01-15' }, ++objectCounter);

logWithAllMethods('Mental health record',
  { therapistId: 'THER-123456', patientId: 'PAT-666', sessionNotes: 'Confidential notes', diagnosis: 'Diagnosis' }, ++objectCounter);

// ============================================================================
// NESTED AND COMPLEX STRUCTURES (Objects 86-95)
// ============================================================================
section('NESTED AND COMPLEX STRUCTURES (Objects 86-95)');

logWithAllMethods('Root level (0 levels nested)',
  { email: 'root@example.com', password: 'secret', ssn: '111-22-3333' }, ++objectCounter);

logWithAllMethods('1 level nested',
  { level1: { email: 'nested1@example.com', password: 'secret1' } }, ++objectCounter);

logWithAllMethods('2 levels nested',
  { level1: { level2: { ssn: '222-33-4444', name: 'Nested User' } } }, ++objectCounter);

logWithAllMethods('3 levels nested',
  {
    level1: {
      level2: {
        level3: {
          email: 'nested3@example.com',
          phone: '555-0001'
        }
      }
    }
  }, ++objectCounter);

logWithAllMethods('4 levels nested',
  {
    level1: {
      level2: {
        level3: {
          level4: {
            creditCard: '4111111111111111',
            cvv: '123'
          }
        }
      }
    }
  }, ++objectCounter);

logWithAllMethods('5 levels nested',
  {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              email: 'deep5@example.com',
              password: 'hidden5'
            }
          }
        }
      }
    }
  }, ++objectCounter);

logWithAllMethods('6 levels nested',
  {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: {
                ssn: '666-77-8888',
                address: '123 Deep St'
              }
            }
          }
        }
      }
    }
  }, ++objectCounter);

logWithAllMethods('Array of users with PII',
  { users: [
    { userId: 'user1', email: 'user1@example.com', name: 'Alice' },
    { userId: 'user2', email: 'user2@example.com', name: 'Bob' }
  ]}, ++objectCounter);

logWithAllMethods('Complex multi-level structure',
  {
    userId: 'user-999',
    personal: { name: 'Complex User', email: 'complex@example.com', ssn: '999-88-7777' },
    contact: { phone: '555-9999', address: '999 Complex St' },
    financial: { cardNumber: '4999888877776666', accountNumber: '9999888877' }
  }, ++objectCounter);

// ============================================================================
// PLAIN STRING PII (Objects 96-105)
// ============================================================================
section('PLAIN STRING PII (Objects 96-105)');
console.log('These examples show d4lPii() used with plain strings.');
console.log('When LOG_HASH_SECRET is set, d4lPii() obfuscates the content.\n');

// Helper for string-only demonstrations
function logString(description: string, str: string, index: number) {
  console.log(`\n[${index}] ${description}`);
  console.log(`    Input:  "${str}"`);
  console.log(`    d4l():           ${d4l(str)}`);
  console.log(`    d4lObfuscate():  ${d4lObfuscate(str)}`);
  console.log(`    d4lPii():        ${d4lPii(str)}`);
}

logString('Name in a sentence', 'Hello my name is Bob Smith', ++objectCounter);
logString('Email in text', 'My email is john@example.com', ++objectCounter);
logString('Phone in text', 'Call me at 555-123-4567', ++objectCounter);
logString('SSN in text', 'My SSN is 123-45-6789', ++objectCounter);
logString('Credit card in text', 'Credit card: 4532-1234-5678-9012', ++objectCounter);
logString('Multiple emails', 'Contact alice@example.com or bob@example.com', ++objectCounter);
logString('IP address', 'Server IP: 192.168.1.100', ++objectCounter);
logString('Password hint', 'Password is super-secret-123', ++objectCounter);
logString('Address', 'I live at 123 Main Street, Boston, MA 02101', ++objectCounter);
logString('Just a name', 'Bob Smith', ++objectCounter);

// ============================================================================
// CONTENT-BASED PII DETECTION IN OBJECTS (Objects 106-120)
// ============================================================================
section('CONTENT-BASED PII DETECTION IN OBJECTS (Objects 106-120)');
console.log('These examples show PII detection based on VALUE patterns,');
console.log('even when field names do NOT explicitly indicate sensitive data.\n');

logWithAllMethods('Generic "data" field containing email',
  { data: 'john@example.com', id: 'record-123' }, ++objectCounter);

logWithAllMethods('Generic "value" field containing SSN',
  { value: '123-45-6789', recordType: 'identity' }, ++objectCounter);

logWithAllMethods('Generic "info" field containing phone',
  { info: '555-123-4567', source: 'contact-form' }, ++objectCounter);

logWithAllMethods('Generic "text" field containing credit card',
  { text: '4532-1234-5678-9012', note: 'payment-info' }, ++objectCounter);

logWithAllMethods('Generic "content" field containing IP address',
  { content: '192.168.1.100', type: 'connection' }, ++objectCounter);

logWithAllMethods('Generic "string" field containing multiple emails',
  { string: 'Contact alice@example.com or bob@example.com', subject: 'team' }, ++objectCounter);

logWithAllMethods('Generic "message" field with SSN embedded',
  { message: 'User SSN is 987-65-4321 for verification', requestId: 'req-456' }, ++objectCounter);

logWithAllMethods('Generic "details" field with phone number',
  { details: 'Please call +1-555-999-8888 for support', ticketId: 'ticket-789' }, ++objectCounter);

logWithAllMethods('Generic "description" with credit card',
  { description: 'Payment via card 4111111111111111', transactionId: 'txn-123' }, ++objectCounter);

logWithAllMethods('Generic "note" with email address',
  { note: 'Follow up with customer@example.com', taskId: 'task-456' }, ++objectCounter);

logWithAllMethods('Array of generic values containing PII',
  { items: ['john@example.com', '555-1234', '123-45-6789'], category: 'mixed' }, ++objectCounter);

logWithAllMethods('Generic "payload" with multiple PII types',
  { payload: 'Name: John Doe, Email: john@example.com, SSN: 111-22-3333', source: 'import' }, ++objectCounter);

logWithAllMethods('Generic "body" with financial data',
  { body: 'Card: 5555-4444-3333-2222, CVV: 123', endpoint: '/payment' }, ++objectCounter);

logWithAllMethods('Generic "input" with coordinates',
  { input: 'lat:42.3601,lon:-71.0589', feature: 'geolocation' }, ++objectCounter);

logWithAllMethods('Generic "raw" with JWT token',
  { raw: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123', format: 'jwt' }, ++objectCounter);

// ============================================================================
// EDGE CASES AND SPECIAL VALUES (Objects 121-130)
// ============================================================================
section('EDGE CASES AND SPECIAL VALUES (Objects 121-130)');

logWithAllMethods('Empty strings and nulls',
  { email: '', password: null, username: undefined, phone: '' }, ++objectCounter);

logWithAllMethods('Boolean and number fields',
  { isActive: true, count: 42, email: 'bool@example.com', age: 30 }, ++objectCounter);

logWithAllMethods('Special characters in values',
  { email: 'test+tag@example.com', password: 'p@$$w0rd!#%', phone: '+1 (555) 123-4567' }, ++objectCounter);

logWithAllMethods('Unicode and emoji',
  { name: 'José García', email: 'josé@example.com', message: 'Hello 👋 World 🌍' }, ++objectCounter);

logWithAllMethods('Very long values',
  {
    email: 'verylongemailaddress@verylongdomainname.com',
    password: 'VeryLongPasswordWith123NumbersAndSpecialChars!@#$%',
    description: 'A'.repeat(100)
  }, ++objectCounter);

logWithAllMethods('Mixed case field names',
  { EMAIL: 'upper@example.com', Password: 'Mixed123', eMail: 'camel@example.com' }, ++objectCounter);

logWithAllMethods('Numeric field names',
  { '123': 'value', '456': 'another', field789: 'test' }, ++objectCounter);

logWithAllMethods('Whitespace in values',
  { email: '  spaced@example.com  ', name: '  John Doe  ', phone: ' 555-1234 ' }, ++objectCounter);

logWithAllMethods('URL parameters with PII',
  { url: 'https://example.com?email=user@example.com&token=abc123&ssn=111-22-3333' }, ++objectCounter);

logWithAllMethods('JSON string containing PII',
  { jsonData: '{"email":"embedded@example.com","password":"secret"}', format: 'json' }, ++objectCounter);

logWithAllMethods('Combined multiple PII types',
  {
    email: 'final@example.com',
    password: 'final123',
    ssn: '999-99-9999',
    phone: '555-9999',
    creditCard: '4999999999999999',
    address: '999 Final St',
    name: 'Final User'
  }, ++objectCounter);

// ============================================================================
// LOG.notice() WITH blurWhereNeeded() EXAMPLES (Objects 131-140)
// ============================================================================
section('LOG.notice() WITH blurWhereNeeded() EXAMPLES (Objects 131-140)');
console.log('These examples demonstrate using LOG.notice() with different blur patterns.\n');

// Pattern 1: Object as second parameter (automatic sanitization if enabled)
console.log(`\n[${++objectCounter}] LOG.notice() with object as second parameter`);
console.log('  Code: LOG.notice(`obj = `, { password: \'abc123\' })');
LOG.notice(`obj = `, { password: 'abc123' });

// Pattern 2: blurWhereNeeded in template string
console.log(`\n[${++objectCounter}] LOG.notice() with blurWhereNeeded in template string`);
console.log('  Code: LOG.notice(`obj = ${blurWhereNeeded({ password: \'abc123\' })}`)');
LOG.notice(`obj = ${blurWhereNeeded({ password: 'abc123' })}`);

// Pattern 3: User credentials with both patterns
console.log(`\n[${++objectCounter}] User credentials - object as parameter`);
console.log('  Code: LOG.notice(`User login`, { username: \'alice\', password: \'secret123\' })');
LOG.notice(`User login`, { username: 'alice', password: 'secret123' });

console.log(`\n[${++objectCounter}] User credentials - blurWhereNeeded in template`);
console.log('  Code: LOG.notice(`User login: ${blurWhereNeeded({ username: \'alice\', password: \'secret123\' })}`)');
LOG.notice(`User login: ${blurWhereNeeded({ username: 'alice', password: 'secret123' })}`);

// Pattern 4: Credit card info
console.log(`\n[${++objectCounter}] Credit card - object as parameter`);
console.log('  Code: LOG.notice(`Payment info`, { cardNumber: \'4532-1234-5678-9012\', cvv: \'123\' })');
LOG.notice(`Payment info`, { cardNumber: '4532-1234-5678-9012', cvv: '123' });

console.log(`\n[${++objectCounter}] Credit card - blurWhereNeeded in template`);
console.log('  Code: LOG.notice(`Payment: ${blurWhereNeeded({ cardNumber: \'4532-1234-5678-9012\', cvv: \'123\' })}`)');
LOG.notice(`Payment: ${blurWhereNeeded({ cardNumber: '4532-1234-5678-9012', cvv: '123' })}`);

// Pattern 5: API keys
console.log(`\n[${++objectCounter}] API key - object as parameter`);
console.log('  Code: LOG.notice(`API config`, { apiKey: \'sk_live_1234567890\' })');
LOG.notice(`API config`, { apiKey: 'sk_live_1234567890' });

console.log(`\n[${++objectCounter}] API key - blurWhereNeeded in template`);
console.log('  Code: LOG.notice(`API config: ${blurWhereNeeded({ apiKey: \'sk_live_1234567890\' })}`)');
LOG.notice(`API config: ${blurWhereNeeded({ apiKey: 'sk_live_1234567890' })}`);

// Pattern 6: Multiple PII fields
console.log(`\n[${++objectCounter}] Multiple PII - object as parameter`);
console.log('  Code: LOG.notice(`User profile`, { email: \'user@example.com\', phone: \'555-1234\', ssn: \'123-45-6789\' })');
LOG.notice(`User profile`, { email: 'user@example.com', phone: '555-1234', ssn: '123-45-6789' });

console.log(`\n[${++objectCounter}] Multiple PII - blurWhereNeeded in template`);
console.log('  Code: LOG.notice(`Profile: ${blurWhereNeeded({ email: \'user@example.com\', phone: \'555-1234\', ssn: \'123-45-6789\' })}`)');
LOG.notice(`Profile: ${blurWhereNeeded({ email: 'user@example.com', phone: '555-1234', ssn: '123-45-6789' })}`);

console.log('\n' + '-'.repeat(80));
console.log('Key Differences:');
console.log('  1. Object as parameter: Sanitization depends on LOG_EAGER_AUTO_SANITIZE setting');
console.log('  2. blurWhereNeeded(): Always applies PII blurring based on LOG_HASH_SECRET');
console.log('  3. Use blurWhereNeeded() when you want explicit control over blur behavior');
console.log('  4. Use object parameter for automatic context logging with conditional sanitization');
console.log('-'.repeat(80));

// ============================================================================
// SUMMARY
// ============================================================================
section('DEMONSTRATION COMPLETE');

console.log(`\nTotal objects logged: ${objectCounter}\n`);
console.log('Summary of Logging Methods:');
console.log('  • d4l():            General debug logging');
console.log('  • d4lObfuscate():   Obfuscated logging');
console.log('  • d4lPii():         PII-aware logging');
console.log('  • blurWhereNeeded(): Explicit PII blurring (always applies blur if LOG_HASH_SECRET set)\n');

console.log('Logging Patterns Demonstrated:');
console.log('  1. logger.info(msg, obj)                      - Pass object as context parameter');
console.log('  2. logger.info(`msg ${d4l(obj)}`)             - Inline with d4l()');
console.log('  3. logger.info(`msg ${d4lObfuscate(obj)}`)    - Inline with d4lObfuscate()');
console.log('  4. logger.info(`msg ${d4lPii(obj)}`)          - Inline with d4lPii()');
console.log('  5. logger.info(msg, { wrapped: d4l(obj) })    - Wrapped in object');
console.log('  6. logger.info(msg, { d4l, d4lPii, raw })     - Multiple methods side-by-side');
console.log('  7. LOG.notice(`msg`, obj)                     - Notice level with object parameter');
console.log('  8. LOG.notice(`msg ${blurWhereNeeded(obj)}`)  - Notice level with explicit blur\n');

console.log('Configuration Options Tested:');
console.log('  • LOG_EAGER_AUTO_SANITIZE: Automatic PII detection and redaction');
console.log('  • LOG_HASH_SECRET:         Enables hashing of sensitive fields');
console.log('  • Combined modes:          Different behaviors based on configuration\n');

console.log('Data Categories Covered:');
console.log('  ✓ User Identity & Authentication (20 objects)');
console.log('  ✓ Contact Information (15 objects)');
console.log('  ✓ Personal Identifiers (15 objects)');
console.log('  ✓ Financial Data (15 objects)');
console.log('  ✓ Location Data (10 objects)');
console.log('  ✓ Medical Data - HIPAA (10 objects)');
console.log('  ✓ Nested & Complex Structures (10 objects)');
console.log('  ✓ Plain String PII (10 objects)');
console.log('  ✓ Content-Based PII Detection in Objects (15 objects)');
console.log('  ✓ Edge Cases & Special Values (10 objects)');
console.log('  ✓ LOG.notice() with blurWhereNeeded() (10 objects)');
console.log();

console.log('Key Features Demonstrated:');
console.log('  • Field name-based PII detection (password, email, ssn, etc.)');
console.log('  • Content pattern-based PII detection (detecting emails in "data" field)');
console.log('  • Nested object handling (5+ levels deep)');
console.log('  • Array processing (arrays of objects with PII)');
console.log('  • Multiple field name variations (camelCase, snake_case, hyphen-case)');
console.log();

console.log('Official List of PII/HIPAA/GDPR Fields Detected:');
console.log('─'.repeat(80));
console.log('\n📋 USER IDENTIFIERS:');
console.log('  userId, user_id, principalId, principal_id, uid, login');
console.log('  username, user_name, userName');

console.log('\n📧 EMAIL VARIATIONS:');
console.log('  email, e_mail, e-mail, eMail, Email');
console.log('  emailAddress, email_address, emailSanitized, email_sanitized');
console.log('  emailNormalized, email_normalized');

console.log('\n👤 NAMES:');
console.log('  name, fullname, fullName, full_name');
console.log('  firstName, first_name, lastName, last_name');
console.log('  middleName, middle_name');

console.log('\n📱 CONTACT INFORMATION:');
console.log('  phone, phoneNumber, phone_number, telephone, mobile, cellPhone');

console.log('\n🆔 SENSITIVE IDENTIFIERS:');
console.log('  ssn, socialSecurity, social_security');
console.log('  dob, dateOfBirth, date_of_birth, birthdate, birth_date');
console.log('  passport, passportNumber, passport_number');
console.log('  license, driversLicense, drivers_license, driverLicense, driver_license');

console.log('\n💳 FINANCIAL INFORMATION:');
console.log('  creditCard, credit_card, creditCardNumber, credit_card_number');
console.log('  ccNumber, cc_number, cardNumber, card_number');
console.log('  cvv, cvc, securityCode, security_code');
console.log('  accountNumber, account_number, bankAccount, bank_account');
console.log('  routingNumber, routing_number');

console.log('\n📍 LOCATION INFORMATION:');
console.log('  address, street, streetAddress, street_address');
console.log('  city, state, province');
console.log('  zip, zipCode, zip_code, postal, postalCode, postal_code');
console.log('  country');
console.log('  ip, ipAddress, ip_address, ipv4, ipv6');
console.log('  lat, latitude, lon, longitude, coordinates');

console.log('\n🔐 AUTHENTICATION & SECURITY:');
console.log('  password, passwd, pwd, pass');
console.log('  secret, apiKey, api_key, accessToken, access_token');
console.log('  refreshToken, refresh_token, token, auth, authToken, auth_token');
console.log('  privateKey, private_key, publicKey, public_key');

console.log('\n🏥 MEDICAL INFORMATION (HIPAA):');
console.log('  medicalRecordNumber, medical_record_number, mrn');
console.log('  healthInsurance, health_insurance, insuranceNumber, insurance_number');

console.log('\n' + '─'.repeat(80));
console.log('\n💡 Notes:');
console.log('  • All field names are case-insensitive');
console.log('  • Partial matches are supported (e.g., "userEmail" matches "email")');
console.log('  • Leading underscores are ignored (e.g., "_email" matches "email")');
console.log('  • Works with camelCase, snake_case, and hyphen-case');
console.log('  • Supports unlimited nesting depth');
console.log('  • Processes arrays recursively');
console.log();

console.log('Try running this demo with different configurations to see how logging behavior changes!');
console.log('='.repeat(80));
console.log();
