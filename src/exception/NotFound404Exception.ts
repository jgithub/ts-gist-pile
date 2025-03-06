export class NotFound404Exception extends Error {
  public readonly statusCode: number = 404;

  constructor(msg: string | undefined = undefined) {
    super(`NotFound404Exception${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotFound404Exception.prototype);
  }
}
