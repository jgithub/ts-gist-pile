import { Brand } from '../type/Brand';

/**
 * Immutable UTC timestamp as an ISO 8601 string.
 *
 * This branded type provides an immutable alternative to Date objects,
 * which are mutable and can lead to unexpected behavior in domain models.
 *
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ (always in UTC)
 *
 * @example
 * const now = ImmutableUtc.now();
 * const later = ImmutableUtc.fromDate(new Date('2024-12-31T23:59:59Z'));
 * const date = ImmutableUtc.toDate(now);
 */
export type ImmutableUtc = Brand<string, 'ImmutableUtc'>;

export const ImmutableUtc = {
  /**
   * Creates an ImmutableUtc from a Date object.
   *
   * @param date - The Date object to convert
   * @returns An immutable UTC timestamp string
   *
   * @example
   * const date = new Date('2024-01-15T10:30:00Z');
   * const immutable = ImmutableUtc.fromDate(date);
   * // immutable = '2024-01-15T10:30:00.000Z'
   */
  fromDate: (date: Date): ImmutableUtc => {
    if (!(date instanceof Date)) {
      throw new Error('ImmutableUtc.fromDate() requires a Date object');
    }
    if (isNaN(date.getTime())) {
      throw new Error('ImmutableUtc.fromDate() received an invalid Date');
    }
    return date.toISOString() as ImmutableUtc;
  },

  /**
   * Creates an ImmutableUtc representing the current moment.
   *
   * @returns An immutable UTC timestamp string for now
   *
   * @example
   * const now = ImmutableUtc.now();
   */
  now: (): ImmutableUtc => {
    return new Date().toISOString() as ImmutableUtc;
  },

  /**
   * Parses an ISO 8601 string into a Date object.
   *
   * @param dateString - ISO 8601 formatted date string
   * @returns A Date object
   * @throws Error if the string cannot be parsed into a valid date
   *
   * @example
   * const date = ImmutableUtc.parse('2024-01-15T10:30:00.000Z');
   */
  parse: (dateString: string): Date => {
    if (typeof dateString !== 'string') {
      throw new Error('ImmutableUtc.parse() requires a string');
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`ImmutableUtc.parse() received an invalid date string: ${dateString}`);
    }
    return date;
  },

  /**
   * Converts an ImmutableUtc to a Date object.
   *
   * @param immutableUtc - The immutable UTC timestamp
   * @returns A Date object
   * @throws Error if the timestamp cannot be parsed into a valid date
   *
   * @example
   * const immutable = ImmutableUtc.now();
   * const date = ImmutableUtc.toDate(immutable);
   */
  toDate: (immutableUtc: ImmutableUtc): Date => {
    return ImmutableUtc.parse(immutableUtc);
  },

  /**
   * Creates an ImmutableUtc from a Unix timestamp (milliseconds since epoch).
   *
   * @param timestamp - Unix timestamp in milliseconds
   * @returns An immutable UTC timestamp string
   * @throws Error if the timestamp is not a valid number
   *
   * @example
   * const immutable = ImmutableUtc.fromMillis(1705318200000);
   * // immutable = '2024-01-15T10:30:00.000Z'
   */
  fromMillis: (timestamp: number): ImmutableUtc => {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      throw new Error('ImmutableUtc.fromMillis() requires a valid number');
    }
    return ImmutableUtc.fromDate(new Date(timestamp));
  },

  /**
   * Converts an ImmutableUtc to a Unix timestamp (milliseconds since epoch).
   *
   * @param immutableUtc - The immutable UTC timestamp
   * @returns Unix timestamp in milliseconds
   *
   * @example
   * const immutable = ImmutableUtc.now();
   * const millis = ImmutableUtc.toMillis(immutable);
   */
  toMillis: (immutableUtc: ImmutableUtc): number => {
    return ImmutableUtc.toDate(immutableUtc).getTime();
  },

  /**
   * Creates an ImmutableUtc from a Unix timestamp (seconds since epoch).
   *
   * @param timestamp - Unix timestamp in seconds
   * @returns An immutable UTC timestamp string
   * @throws Error if the timestamp is not a valid number
   *
   * @example
   * const immutable = ImmutableUtc.fromSeconds(1705318200);
   * // immutable = '2024-01-15T10:30:00.000Z'
   */
  fromSeconds: (timestamp: number): ImmutableUtc => {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      throw new Error('ImmutableUtc.fromSeconds() requires a valid number');
    }
    return ImmutableUtc.fromMillis(timestamp * 1000);
  },

  /**
   * Converts an ImmutableUtc to a Unix timestamp (seconds since epoch).
   *
   * @param immutableUtc - The immutable UTC timestamp
   * @returns Unix timestamp in seconds
   *
   * @example
   * const immutable = ImmutableUtc.now();
   * const seconds = ImmutableUtc.toSeconds(immutable);
   */
  toSeconds: (immutableUtc: ImmutableUtc): number => {
    return Math.floor(ImmutableUtc.toMillis(immutableUtc) / 1000);
  },

  /**
   * Checks if a string is a valid ImmutableUtc (valid ISO 8601 date string).
   *
   * @param value - The value to check
   * @returns True if the value is a valid ISO 8601 date string
   *
   * @example
   * ImmutableUtc.isValid('2024-01-15T10:30:00.000Z'); // true
   * ImmutableUtc.isValid('not-a-date'); // false
   */
  isValid: (value: any): value is ImmutableUtc => {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date.toISOString() === value;
    } catch {
      return false;
    }
  },

  /**
   * Compares two ImmutableUtc timestamps.
   *
   * @param a - First timestamp
   * @param b - Second timestamp
   * @returns Negative if a < b, 0 if equal, positive if a > b
   *
   * @example
   * const earlier = ImmutableUtc.build(new Date('2024-01-01'));
   * const later = ImmutableUtc.build(new Date('2024-12-31'));
   * ImmutableUtc.compare(earlier, later); // negative number
   */
  compare: (a: ImmutableUtc, b: ImmutableUtc): number => {
    return ImmutableUtc.toMillis(a) - ImmutableUtc.toMillis(b);
  },

  /**
   * Returns the earlier of two ImmutableUtc timestamps.
   *
   * @param a - First timestamp
   * @param b - Second timestamp
   * @returns The earlier timestamp
   */
  min: (a: ImmutableUtc, b: ImmutableUtc): ImmutableUtc => {
    return ImmutableUtc.compare(a, b) <= 0 ? a : b;
  },

  /**
   * Returns the later of two ImmutableUtc timestamps.
   *
   * @param a - First timestamp
   * @param b - Second timestamp
   * @returns The later timestamp
   */
  max: (a: ImmutableUtc, b: ImmutableUtc): ImmutableUtc => {
    return ImmutableUtc.compare(a, b) >= 0 ? a : b;
  }
};
