# Blur API - Quick Reference

## The Complete API

```typescript
import { plain, blur, blurIfEnabled, blurWhereNeeded } from '@jgithub/ts-gist-pile';
```

### 1. `plain()` - No Protection
**Alias for:** `d4l()`
**Speed:** ⚡⚡⚡ Fastest
**Always active:** No

```typescript
plain("john@example.com")
// → 'john@example.com' (string, 16)
```

**Use when:** Non-sensitive data, development logging

---

### 2. `blur()` - Always Obfuscate
**Alias for:** `d4lObfuscate()`
**Speed:** ⚡⚡ Fast
**Always active:** Yes

```typescript
blur("john@example.com")
// → jo****@example.com

// With LOG_HASH_SECRET:
blur("john@example.com")
// → jo****@example.com (hashed=154f1e27c50a)
```

**Use when:** Tokens, API keys, values that should always be hidden

---

### 3. `blurIfEnabled()` - Environment-Based
**Alias for:** `d4lPii()`
**Speed:** ⚡⚡ Fast
**Always active:** Only if `LOG_HASH_SECRET` is set

```typescript
// Without LOG_HASH_SECRET:
blurIfEnabled("john@example.com")
// → 'john@example.com' (string, 16)

// With LOG_HASH_SECRET:
blurIfEnabled("john@example.com")
// → jo****@example.com (hashed=154f1e27c50a)
```

**Use when:** PII that needs dev visibility but production protection

---

### 4. `blurWhereNeeded()` - Smart Scanner
**Speed:** ⚡ Slowest (content scanning)
**Always active:** Yes

```typescript
blurWhereNeeded("My email is john@example.com and phone is 555-1234")
// → "My email is jo****@example.com and phone is ****1234"

blurWhereNeeded("Contact Bob Smith at bob@example.com")
// → "Contact Bo**** Sm**** at bo****@example.com"

blurWhereNeeded("This is just a normal message")
// → "This is just a normal message"  (no changes)
```

**Detects:** Emails, SSNs, phones, credit cards, IPs, names
**Use when:** User input, error messages, free-form text with potential PII

---

## Quick Comparison

| Scenario | Function | Output |
|----------|----------|--------|
| Debug ID | `plain(userId)` | `'user-123' (string, 8)` |
| API Token | `blur(token)` | `****xyz` |
| User Email (dev) | `blurIfEnabled(email)` | `'john@example.com' (string, 16)` |
| User Email (prod) | `blurIfEnabled(email)` | `jo****@example.com (hashed=...)` |
| Error with PII | `blurWhereNeeded(msg)` | `Card ****9012 invalid` |

---

## The Four Questions

**1. Is it sensitive at all?**
- No → `plain()`

**2. Should it ALWAYS be hidden?**
- Yes → `blur()`

**3. Should it be hidden in production only?**
- Yes → `blurIfEnabled()`

**4. Might it contain PII within text?**
- Yes → `blurWhereNeeded()`

---

## Real-World Examples

### Basic Logging
```typescript
logger.info(`User ${plain(userId)} logged in from ${blurIfEnabled(ipAddress)}`);
// Dev:  User 'user-123' (string, 8) logged in from '192.168.1.100' (string, 13)
// Prod: User 'user-123' (string, 8) logged in from ****.100 (hashed=...)
```

### API Request
```typescript
logger.info(`API call with token ${blur(apiToken)}`);
// Always: API call with token ****xyz
```

### User Input
```typescript
logger.info(`User message: ${blurWhereNeeded(userMessage)}`);
// Input:  "Contact me at john@example.com or 555-1234"
// Output: "Contact me at jo****@example.com or ****1234"
```

### Error Handling
```typescript
try {
  processPayment(cardNumber);
} catch (error) {
  logger.error(`Payment failed: ${blurWhereNeeded(error.message)}`);
  // "Payment failed: Invalid card ****9012"
}
```

---

## Migration Cheat Sheet

```typescript
// Old way
logger.info(`User: ${d4l(email)}`);  // Always visible!

// New way - dev visible, prod hidden
logger.info(`User: ${blurIfEnabled(email)}`);

// Old way - manual regex
message.replace(/\w+@\w+\.\w+/g, '***')

// New way - smart detection
blurWhereNeeded(message)
```

---

## Environment Variables

```bash
# Development (everything visible)
npx ts-node app.ts

# Production (PII protection)
LOG_HASH_SECRET=your-secret-key npx ts-node app.ts

# Production (maximum protection)
LOG_HASH_SECRET=your-secret-key \
LOG_EAGER_AUTO_SANITIZE=true \
npx ts-node app.ts
```

---

## Performance Tips

```typescript
// ✅ Fast - use for high-volume logging
plain(value)
blur(value)
blurIfEnabled(value)

// ⚠️ Slower - use selectively
blurWhereNeeded(value)  // Multiple regex scans

// ✅ Smart approach
if (userInput.length < 1000) {
  logger.info(blurWhereNeeded(userInput));
} else {
  logger.info(blur(userInput));  // Fallback to faster option
}
```
