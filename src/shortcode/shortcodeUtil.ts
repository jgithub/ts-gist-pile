/**
 * Short code generation utilities for URL shorteners and similar use cases.
 *
 * Two alphabets are provided:
 *
 * - 58 chars (ALPHABET_58): Self-healing. Generates 0 and 1 but never O/o/l/I.
 *   If user mistypes O or o, normalizeShortCode58() corrects to 0.
 *   If user mistypes l or I, normalizeShortCode58() corrects to 1.
 *
 * - 56 chars (ALPHABET_56): Excludes ALL six confusable characters (0, 1, O, o, l, I).
 *   No normalization needed - every character is visually unambiguous.
 *
 * At 8 characters:
 * - 58^8 = 128 trillion combinations
 * - 56^8 = 96 trillion combinations
 */

/**
 * 58-character alphabet for short code generation.
 * Only generates 0 and 1 (never O, o, l, I).
 * Self-healing: if user mistypes O/o, normalize to 0. If user mistypes l/I, normalize to 1.
 * Use normalizeShortCode58() on user input before lookup.
 */
export const ALPHABET_58 = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

/**
 * 56-character alphabet for short code generation.
 * Excludes 0, 1, O, o, l, I (all six confusable characters).
 * No normalization needed - every character is visually distinct.
 */
export const ALPHABET_56 = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

/**
 * Generate a random short code using the 58-character alphabet.
 * 58^8 = 128 trillion combinations at 8 characters.
 *
 * When looking up codes, use normalizeShortCode58() to handle user typos
 * (e.g., user types 'O' instead of '0').
 *
 * @param length - Number of characters (default: 8)
 * @returns Random short code string
 */
export function generateShortCode58(length: number = 8): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET_58.length);
    code += ALPHABET_58[randomIndex];
  }
  return code;
}

/**
 * Generate a random short code using the 56-character alphabet.
 * 56^8 = 96 trillion combinations at 8 characters.
 *
 * This alphabet excludes all confusable characters (0, 1, O, o, l, I),
 * so no normalization is needed on lookup.
 *
 * @param length - Number of characters (default: 8)
 * @returns Random short code string
 */
export function generateShortCode56(length: number = 8): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET_56.length);
    code += ALPHABET_56[randomIndex];
  }
  return code;
}

/**
 * Normalize a short code by auto-correcting confusable characters.
 * Use this when looking up codes generated with ALPHABET_58.
 *
 * Transformations:
 * - O, o → 0 (letter O to digit zero)
 * - l, I → 1 (lowercase L and uppercase I to digit one)
 *
 * This allows users to type 'jeanOcaI' and have it resolve to 'jean0ca1'.
 *
 * @param shortCode - The user-entered short code
 * @returns Normalized short code with confusables replaced
 */
export function normalizeShortCode58(shortCode: string): string {
  return shortCode
    .replace(/[Oo]/g, '0')  // O and o → 0 (zero)
    .replace(/[lI]/g, '1'); // l and I → 1 (one)
}

/**
 * Calculate the number of possible combinations for a given alphabet and length.
 *
 * @param alphabetSize - Number of characters in the alphabet (e.g., 58 or 56)
 * @param length - Length of the short code
 * @returns Number of possible combinations
 */
export function calculateCombinations(alphabetSize: number, length: number): number {
  return Math.pow(alphabetSize, length);
}
