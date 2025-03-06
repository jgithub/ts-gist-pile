/**
 * HTTP standard says this means Unauthorized
 * but actually it means Unauthenticated
 */

export class Forbidden403Exception extends Error {
  public readonly statusCode: number = 403;

  constructor(msg: string | undefined = undefined) {
    super(`Forbidden403Exception${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, Forbidden403Exception.prototype);
  }
}
