/**
 * Branded type utility for creating nominal types in TypeScript.
 *
 * A branded type allows you to create a type that is structurally identical
 * to another type but is treated as distinct by the type system.
 *
 * @example
 * type UserId = Brand<string, 'UserId'>;
 * type Email = Brand<string, 'Email'>;
 *
 * const userId: UserId = 'user123' as UserId;
 * const email: Email = 'test@example.com' as Email;
 *
 * // TypeScript will prevent this at compile time:
 * // const invalid: UserId = email; // Error!
 */
export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };
