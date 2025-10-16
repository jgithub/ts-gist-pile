/**
 * Normalizes a phone number to E.164 format: +[country code][subscriber number]
 *
 * Examples:
 *   "(415) 555-2671"     → "+14155552671"
 *   "415-555-2671"       → "+14155552671"
 *   "4155552671"         → "+14155552671" (assumes US)
 *   "+1-415-555-2671"    → "+14155552671"
 *   "+44 20 7183 8750"   → "+442071838750"
 *
 * @param phone - Phone number in various formats
 * @returns E.164 formatted phone number (+ followed by digits only)
 * @throws Error if phone number is invalid or cannot be normalized
 */
export function normalizePhone(phone: string): string {
  if (!phone || phone.trim().length === 0) {
    throw new Error('Phone number cannot be empty');
  }

  // Remove all whitespace, dashes, parentheses, dots
  let normalized = phone.replace(/[\s\-\(\)\.\[\]]/g, '');

  // If it starts with +, keep it. Otherwise extract only digits
  let hasPlus = normalized.startsWith('+');
  let digits = normalized.replace(/\D/g, ''); // Extract only digits

  // If already has +, return + plus the digits
  if (hasPlus) {
    normalized = '+' + digits;
  } else {
    // No country code provided - assume US (+1) for 10 or 11 digit numbers
    if (digits.length === 10) {
      // 10 digits → US number without country code
      normalized = '+1' + digits;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      // 11 digits starting with 1 → US number with country code
      normalized = '+' + digits;
    } else if (digits.length >= 7 && digits.length <= 15) {
      // Other valid lengths - require explicit + country code
      throw new Error(`Phone number must include country code (use +): ${phone}`);
    } else {
      throw new Error(`Invalid phone number length: ${phone}`);
    }
  }

  // Validate E.164 format: + followed by 7-15 digits
  if (!/^\+[1-9]\d{6,14}$/.test(normalized)) {
    throw new Error(`Invalid E.164 format: ${normalized} (from: ${phone})`);
  }

  return normalized;
}
