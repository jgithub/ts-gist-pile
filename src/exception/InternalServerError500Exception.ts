export class InternalServerError500Exception extends Error {
  public readonly statusCode: number = 500;

  constructor(msg: string | undefined = undefined) {
    super(`InternalServerError500Exception${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InternalServerError500Exception.prototype);
  }
}
