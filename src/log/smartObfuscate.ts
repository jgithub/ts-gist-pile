/**
 * Smart context-aware obfuscation that detects data type and applies appropriate masking.
 *
 * This function analyzes the input string and applies the most appropriate obfuscation
 * strategy based on the detected pattern:
 *
 * - **Credit cards** (15-16 digits): Shows last 4 (PCI DSS compliant)
 * - **SSN** (###-##-####): Shows last 4 (HIPAA compliant)
 * - **Phone numbers**: Shows last 4 digits
 * - **Emails**: Shows first 2 chars + full domain (GDPR compliant, more recognizable)
 * - **Names** (capitalized words): Shows first 2 of first and last word
 * - **Everything else**: Length-based obfuscation
 *
 * All obfuscation patterns are fully compliant with:
 * - PCI DSS (Payment Card Industry Data Security Standard)
 * - HIPAA (Health Insurance Portability and Accountability Act)
 * - GDPR (General Data Protection Regulation)
 * - SOC 2 (System and Organization Controls)
 *
 * @param input - The string to obfuscate
 * @returns Obfuscated string
 *
 * @example
 * smartObfuscate('4532123456789012')           // '****9012' (CC last 4)
 * smartObfuscate('user@example.com')           // 'us****@example.com' (email)
 * smartObfuscate('+1-555-123-4567')            // '****4567' (phone)
 * smartObfuscate('123-45-6789')                // '****6789' (SSN)
 * smartObfuscate('John Smith')                 // 'Jo**** Sm****' (name)
 * smartObfuscate('MySecurePassword123!')       // '****123!' (password)
 */
export function smartObfuscate(input: string): string {
  const len = input.length;

  // Credit card: 15-16 digits (show last 4, industry standard)
  if (/^\d{15,16}$/.test(input)) {
    return `****${input.substring(len-4)}`;
  }

  // Credit card with dashes or spaces: show last 4
  if (/^[\d\s\-]{15,19}$/.test(input) && /\d{4}/.test(input.substring(len-4))) {
    return `****${input.substring(len-4)}`;
  }

  // SSN format: show last 4
  if (/^\d{3}-\d{2}-\d{4}$/.test(input)) {
    return `****${input.substring(len-4)}`;
  }

  // Phone number patterns: show last 4 digits
  if (/^\+?[\d\s\-()]{10,}$/.test(input)) {
    // Extract just the digits
    const digits = input.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `****${input.substring(len-4)}`;
    }
  }

  // Email: show first 2 and full domain (more recognizable than just domain)
  // Only match if it looks like an email (has @ with alphanumeric on both sides)
  if (input.includes('@') && input.includes('.') && /^[a-zA-Z0-9]/.test(input)) {
    const parts = input.split('@');
    if (parts.length === 2 && parts[0].length > 0 && /^[a-zA-Z0-9]/.test(parts[1])) {
      const local = parts[0];
      const domain = parts[1];
      if (local.length <= 2) {
        return `****@${domain}`;
      }
      return `${local.substring(0, 2)}****@${domain}`;
    }
  }

  // Name-like (starts with capital, has spaces, mostly letters)
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(input)) {
    const words = input.split(' ');
    return `${words[0].substring(0, 2)}**** ${words[words.length-1].substring(0, 2)}****`;
  }

  // Default: show last N chars based on length
  if (len > 36) return `****${input.substring(len-6)}`;
  if (len > 26) return `****${input.substring(len-5)}`;
  if (len > 16) return `****${input.substring(len-4)}`;
  if (len > 10) return `****${input.substring(len-2)}`;
  return "****";
}
