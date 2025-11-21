# Blur API Guide

## Overview

The blur API provides four functions for handling sensitive data in logs, with different behaviors and performance characteristics.

## Functions

### 1. `plain()` - Plain Text Logging (Alias: `d4l()`)
**Speed:** ⚡⚡⚡ Fastest
**Behavior:** No obfuscation, just formatting

```typescript
plain("john@example.com")
// → 'john@example.com' (string, 16)

plain({ email: "john@example.com", password: "secret123" })
// → {"email":"john@example.com","password":"secret123"} (object)
```

**Use when:** Non-sensitive data, development environments

---

### 2. `blur()` - Always Obfuscate (Alias: `d4lObfuscate()`)
**Speed:** ⚡⚡ Fast
**Behavior:** Always obfuscates entire value using smart patterns

```typescript
blur("john@example.com")
// → jo****@example.com

blur("My email is john@example.com")
// → My****@example.com  (whole string obfuscated)

// With LOG_HASH_SECRET set:
blur("john@example.com")
// → jo****@example.com (hashed=154f1e27c50a)
```

**Use when:**
- Values that should always be hidden
- Simple scalars (IDs, tokens, API keys)
- When you want consistent obfuscation regardless of environment

---

### 3. `blurIfEnabled()` - Environment-Based (Alias: `d4lPii()`)
**Speed:** ⚡⚡ Fast
**Behavior:** Obfuscates only if `LOG_HASH_SECRET` is set

```typescript
// Without LOG_HASH_SECRET (development):
blurIfEnabled("john@example.com")
// → 'john@example.com' (string, 16)  (readable)

// With LOG_HASH_SECRET (production):
blurIfEnabled("john@example.com")
// → jo****@example.com (hashed=154f1e27c50a)  (obfuscated)
```

**Use when:**
- Environment-based protection (dev=readable, prod=hidden)
- PII that developers need to see during debugging
- Production safety with development convenience

---

### 4. `blurWhereNeeded()` - Smart Content Scanner (NEW!)
**Speed:** ⚡ Slowest (content scanning)
**Behavior:** Scans content for PII patterns, redacts only sensitive parts

```typescript
blurWhereNeeded("My email is john@example.com")
// → "My email is jo****@example.com"  (only email redacted!)

blurWhereNeeded("Contact Bob Smith at bob@example.com or 555-123-4567")
// → "Contact Bo**** Sm**** at bo****@example.com or ****4567"

blurWhereNeeded("SSN: 123-45-6789, Card: 4532-1234-5678-9012")
// → "SSN: ****6789, Card: ****9012"

blurWhereNeeded("This is just a normal message")
// → "This is just a normal message"  (no changes)
```

**Detects and redacts:**
- ✅ Email addresses
- ✅ Phone numbers (various formats)
- ✅ SSNs (###-##-####)
- ✅ Credit card numbers (15-16 digits)
- ✅ IP addresses (IPv4)
- ✅ Names (capitalized First Last pattern)

**Use when:**
- User input or messages that might contain PII
- Error messages with embedded sensitive data
- Support tickets, chat logs, form submissions
- Free-form text where context is important

⚠️ **Performance Note:** This function runs multiple regex patterns. Use for text that truly needs content scanning, not structured data.

---

## Comparison Table

| Function | Speed | Always Active? | Whole String? | Content Aware? |
|----------|-------|----------------|---------------|----------------|
| `plain()` | ⚡⚡⚡ | No | N/A | N/A |
| `blur()` | ⚡⚡ | Yes | Yes | Pattern-based* |
| `blurIfEnabled()` | ⚡⚡ | Only if `LOG_HASH_SECRET` set | Yes | Pattern-based* |
| `blurWhereNeeded()` | ⚡ | Yes | No | Yes |

\* Pattern-based = smartObfuscate detects email/SSN/card in the value itself, but obfuscates the entire value

---

## Examples

### Logging User Actions

```typescript
import { getLogger, plain, blur, blurIfEnabled, blurWhereNeeded } from '@jgithub/ts-gist-pile';

const logger = getLogger('UserService');

// Non-sensitive data
logger.info(`User ${plain(userId)} logged in`);

// Always hide token
logger.info(`API request with token ${blur(apiToken)}`);

// Environment-based (readable in dev, hidden in prod)
logger.info(`User email: ${blurIfEnabled(userEmail)}`);

// User input that might contain PII
logger.info(`User message: ${blurWhereNeeded(userMessage)}`);
```

### Handling Error Messages

```typescript
try {
  processPayment(cardNumber);
} catch (error) {
  // Error message might contain card number
  logger.error(`Payment failed: ${blurWhereNeeded(error.message)}`);
  // → "Payment failed: Invalid card ****9012"
}
```

### Support Ticket Logging

```typescript
function logSupportTicket(ticket: SupportTicket) {
  logger.info('New support ticket', {
    ticketId: ticket.id,
    category: ticket.category,
    // User's message might contain PII
    message: blurWhereNeeded(ticket.message)
  });
}
```

---

## Environment Variables

### `LOG_HASH_SECRET`

When set, enables PII hashing for `blur()` and `blurIfEnabled()`:

```bash
# Development (no hashing)
npx ts-node app.ts

# Production (with hashing)
LOG_HASH_SECRET=your-secret-key npx ts-node app.ts
```

### `LOG_EAGER_AUTO_SANITIZE`

When enabled, automatically sanitizes PII in structured objects passed to logger context:

```bash
LOG_EAGER_AUTO_SANITIZE=true npx ts-node app.ts
```

```typescript
logger.info('User data', {
  email: 'john@example.com',
  password: 'secret123'
});
// → With LOG_EAGER_AUTO_SANITIZE:
// {"email":"****@example.com","password":"****123"}
```

---

## Best Practices

1. **Use `plain()` by default** - Only obfuscate when needed
2. **Use `blur()` for tokens/keys** - Always hide, simple values
3. **Use `blurIfEnabled()` for PII** - Environment-based protection
4. **Use `blurWhereNeeded()` sparingly** - Only for user input/messages that need content scanning
5. **Set `LOG_HASH_SECRET` in production** - Enables correlation while protecting data
6. **Enable `LOG_EAGER_AUTO_SANITIZE` in production** - Automatic protection for structured data

---

## Migration Guide

### From `d4l()` only:

```typescript
// Before
logger.info(`User ${plain(userEmail)} signed up`);

// After (production-safe)
logger.info(`User ${blurIfEnabled(userEmail)} signed up`);
```

### From manual redaction:

```typescript
// Before
logger.info(`Message: ${message.replace(/\w+@\w+\.\w+/g, '***')}`);

// After (comprehensive)
logger.info(`Message: ${blurWhereNeeded(message)}`);
```

---

## Performance Considerations

For high-volume logging:

```typescript
// ✅ Good - fast operations
logger.info(`Request from ${blurIfEnabled(userId)}`);

// ⚠️ Be cautious - slower
logger.info(`User input: ${blurWhereNeeded(largeUserMessage)}`);

// ✅ Better - limit when needed
if (userMessage.length < 1000) {
  logger.info(`User input: ${blurWhereNeeded(userMessage)}`);
} else {
  logger.info(`User input: ${blur(userMessage)}`); // Faster fallback
}
```
