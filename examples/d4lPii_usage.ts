/**
 * Real-world usage examples of d4lPii()
 *
 * This shows how to use d4lPii() in actual logging scenarios
 *
 * Run:
 *   LOG_HASH_SECRET=my-secret-key-123 LOG_USE_JSON_FORMAT=true LOG_INFO=true npx ts-node examples/d4lPii_usage.ts
 */

import { getLogger, d4l, d4lPii } from '../src/index';

const logger = getLogger('UsageExample');

console.log('Real-world d4lPii() Usage Examples');
console.log('='.repeat(60));
console.log();

// Scenario 1: User Authentication
function handleUserLogin(userId: string, ipAddress: string, userAgent: string) {
  logger.info(`User login: userId=${d4lPii(userId)}, ip=${d4lPii(ipAddress)}, userAgent=${d4l(userAgent)}`);
}

handleUserLogin('user-12345', '192.168.1.100', 'Mozilla/5.0');
console.log();

// Scenario 2: API Request Logging
function logApiRequest(principalId: string, endpoint: string, method: string) {
  logger.info(`API request: ${d4l(method)} ${d4l(endpoint)} by principal ${d4lPii(principalId)}`);
}

logApiRequest('principal-abc-123', '/api/users/profile', 'GET');
console.log();

// Scenario 3: Database Query Logging
function logDatabaseQuery(userId: string, query: string, executionTime: number) {
  logger.debug(`DB query for user ${d4lPii(userId)}: ${d4l(query)} (${d4l(executionTime)}ms)`);
}

logDatabaseQuery('user-67890', 'SELECT * FROM orders WHERE user_id = ?', 45);
console.log();

// Scenario 4: Error Logging with PII
function handlePaymentError(userId: string, email: string, errorCode: string, errorMessage: string) {
  logger.error(`Payment failed for user ${d4lPii(userId)} (email: ${d4lPii(email)}): ${d4l(errorCode)} - ${d4l(errorMessage)}`);
}

handlePaymentError('user-99999', 'john@example.com', 'INSUFFICIENT_FUNDS', 'Payment declined by bank');
console.log();

// Scenario 5: Audit Logging
function logAuditEvent(principalId: string, action: string, resourceId: string, result: string) {
  logger.notice(`Audit: principal ${d4lPii(principalId)} performed ${d4l(action)} on resource ${d4l(resourceId)}: ${d4l(result)}`);
}

logAuditEvent('principal-admin-001', 'DELETE', 'resource-xyz-789', 'SUCCESS');
console.log();

// Scenario 6: Mixing PII and non-PII in structured logging
function logUserActivity(userId: string, email: string, action: string, timestamp: Date) {
  logger.info('User activity', {
    userId: userId,        // This will be auto-hashed by jsonContext sanitization
    email: email,          // This will be auto-hashed by jsonContext sanitization
    action: action,        // Not PII - will remain
    timestamp: timestamp.toISOString()  // Not PII - will remain
  });
}

logUserActivity('user-11111', 'jane@example.com', 'VIEW_DASHBOARD', new Date());
console.log();

// Scenario 7: Batch operation logging
function logBatchProcessing(userIds: string[], operation: string, successCount: number, failCount: number) {
  const hashedUserIds = userIds.map(id => d4lPii(id)).join(', ');
  logger.info(`Batch ${d4l(operation)}: processed ${d4l(userIds.length)} users [${hashedUserIds}] - success: ${d4l(successCount)}, failed: ${d4l(failCount)}`);
}

logBatchProcessing(['user-1', 'user-2', 'user-3'], 'EMAIL_NOTIFICATION', 2, 1);
console.log();

console.log('='.repeat(60));
console.log('Key Takeaways:');
console.log('='.repeat(60));
console.log('1. Use d4lPii() for PII values: userId, email, IP addresses, etc.');
console.log('2. Use d4l() for non-PII values: actions, endpoints, error codes, etc.');
console.log('3. When using jsonContext, PII fields are auto-sanitized');
console.log('4. d4lPii() provides explicit PII marking in your code');
console.log('5. Works seamlessly with or without LOG_HASH_SECRET');
console.log();
