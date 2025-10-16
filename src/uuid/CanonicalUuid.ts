import { Brand } from '../type/Brand';
import { isWellFormedCanonicalUuid } from '../string/stringUtil';
import { v4, v7 } from 'uuid';

/**
 * Canonical UUID as a branded lowercase string with hyphens.
 *
 * This branded type ensures UUIDs are always in canonical format:
 * lowercase, with hyphens in the standard positions.
 *
 * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (all lowercase hex)
 *
 * @example
 * const id = CanonicalUuid.v4();
 * const parsed = CanonicalUuid.fromString('550e8400-e29b-41d4-a716-446655440000');
 * const asString = CanonicalUuid.toString(id);
 */
export type CanonicalUuid = Brand<string, 'CanonicalUuid'>;

export const CanonicalUuid = {
  /**
   * Creates a CanonicalUuid from a string, validating and normalizing it.
   *
   * The input will be converted to lowercase and validated against
   * the canonical UUID format.
   *
   * @param uuid - UUID string to validate and normalize
   * @returns A canonical UUID
   * @throws Error if the string is not a valid UUID
   *
   * @example
   * const id = CanonicalUuid.fromString('550E8400-E29B-41D4-A716-446655440000');
   * // id = '550e8400-e29b-41d4-a716-446655440000'
   */
  fromString: (uuid: string): CanonicalUuid => {
    if (typeof uuid !== 'string') {
      throw new Error('CanonicalUuid.fromString() requires a string');
    }

    const normalized = uuid.toLowerCase().trim();

    if (!isWellFormedCanonicalUuid(normalized)) {
      throw new Error(`CanonicalUuid.fromString() received an invalid UUID: ${uuid}`);
    }

    return normalized as CanonicalUuid;
  },

  /**
   * Alias for fromString() for consistency with other parse methods.
   *
   * @param uuid - UUID string to validate and normalize
   * @returns A canonical UUID
   * @throws Error if the string is not a valid UUID
   */
  parse: (uuid: string): CanonicalUuid => {
    return CanonicalUuid.fromString(uuid);
  },

  /**
   * Generates a new random UUID v4.
   *
   * UUIDv4 uses random numbers and is suitable for general-purpose unique identifiers.
   *
   * @returns A new random canonical UUID
   *
   * @example
   * const id = CanonicalUuid.v4();
   * // id = '550e8400-e29b-41d4-a716-446655440000'
   */
  v4: (): CanonicalUuid => {
    return v4().toLowerCase() as CanonicalUuid;
  },

  /**
   * Generates a new time-ordered UUID v7.
   *
   * UUIDv7 includes a timestamp and can be sorted chronologically,
   * making it ideal for database primary keys and time-ordered identifiers.
   *
   * @returns A new time-ordered canonical UUID
   *
   * @example
   * const id = CanonicalUuid.v7();
   * // id = '01878a4a-52d9-7000-8000-000000000000'
   */
  v7: (): CanonicalUuid => {
    return v7().toLowerCase() as CanonicalUuid;
  },

  /**
   * Converts a CanonicalUuid to a plain string.
   *
   * This is mostly for API consistency - CanonicalUuid is already a string,
   * but this makes the conversion explicit.
   *
   * @param uuid - The canonical UUID
   * @returns The UUID as a plain string
   *
   * @example
   * const id = CanonicalUuid.v4();
   * const str = CanonicalUuid.toString(id);
   */
  toString: (uuid: CanonicalUuid): string => {
    return uuid as string;
  },

  /**
   * Checks if a value is a valid CanonicalUuid.
   *
   * @param value - The value to check
   * @returns True if the value is a valid canonical UUID
   *
   * @example
   * CanonicalUuid.isValid('550e8400-e29b-41d4-a716-446655440000'); // true
   * CanonicalUuid.isValid('550E8400-E29B-41D4-A716-446655440000'); // true (case-insensitive check)
   * CanonicalUuid.isValid('not-a-uuid'); // false
   * CanonicalUuid.isValid('550e8400e29b41d4a716446655440000'); // false (missing hyphens)
   */
  isValid: (value: any): value is CanonicalUuid => {
    if (typeof value !== 'string') {
      return false;
    }
    return isWellFormedCanonicalUuid(value);
  },

  /**
   * Compares two CanonicalUuids lexicographically.
   *
   * This is particularly useful for v7 UUIDs, which are time-ordered.
   * Earlier v7 UUIDs will sort before later ones.
   *
   * @param a - First UUID
   * @param b - Second UUID
   * @returns Negative if a < b, 0 if equal, positive if a > b
   *
   * @example
   * const earlier = CanonicalUuid.v7();
   * await sleep(10);
   * const later = CanonicalUuid.v7();
   * CanonicalUuid.compare(earlier, later); // negative number
   */
  compare: (a: CanonicalUuid, b: CanonicalUuid): number => {
    return a.localeCompare(b);
  },

  /**
   * Returns the lexicographically earlier of two UUIDs.
   *
   * For v7 UUIDs, this returns the chronologically earlier UUID.
   *
   * @param a - First UUID
   * @param b - Second UUID
   * @returns The earlier UUID
   */
  min: (a: CanonicalUuid, b: CanonicalUuid): CanonicalUuid => {
    return CanonicalUuid.compare(a, b) <= 0 ? a : b;
  },

  /**
   * Returns the lexicographically later of two UUIDs.
   *
   * For v7 UUIDs, this returns the chronologically later UUID.
   *
   * @param a - First UUID
   * @param b - Second UUID
   * @returns The later UUID
   */
  max: (a: CanonicalUuid, b: CanonicalUuid): CanonicalUuid => {
    return CanonicalUuid.compare(a, b) >= 0 ? a : b;
  },

  /**
   * Extracts the version number from a UUID.
   *
   * @param uuid - The UUID to inspect
   * @returns The version number (1-7)
   *
   * @example
   * const v4Id = CanonicalUuid.v4();
   * CanonicalUuid.getVersion(v4Id); // 4
   *
   * const v7Id = CanonicalUuid.v7();
   * CanonicalUuid.getVersion(v7Id); // 7
   */
  getVersion: (uuid: CanonicalUuid): number => {
    // Version is in the 15th character (M in: xxxxxxxx-xxxx-Mxxx-xxxx-xxxxxxxxxxxx)
    const versionChar = uuid.charAt(14);
    return parseInt(versionChar, 16);
  },

  /**
   * Checks if a UUID is a v7 (time-ordered) UUID.
   *
   * @param uuid - The UUID to check
   * @returns True if the UUID is version 7
   */
  isV7: (uuid: CanonicalUuid): boolean => {
    return CanonicalUuid.getVersion(uuid) === 7;
  },

  /**
   * Checks if a UUID is a v4 (random) UUID.
   *
   * @param uuid - The UUID to check
   * @returns True if the UUID is version 4
   */
  isV4: (uuid: CanonicalUuid): boolean => {
    return CanonicalUuid.getVersion(uuid) === 4;
  }
};
