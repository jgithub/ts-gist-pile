/**
 * Normalizes an email address to a standard format.
 * Trims whitespace and converts to lowercase.
 *
 * @param email - Email address to normalize
 * @returns Normalized email address
 *
 * @example
 * normalizeEmail("  User@Example.COM  ") // returns "user@example.com"
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
