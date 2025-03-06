/**
 * HTTP standard says this means Unauthorized
 * but actually it means Unauthenticated
 */

export class ActuallyUnauthenticated401Exception extends Error {
  public readonly statusCode: number = 401;

  constructor(msg: string | undefined = undefined) {
    super(`ActuallyUnauthenticated401Exception${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ActuallyUnauthenticated401Exception.prototype);
  }
}
