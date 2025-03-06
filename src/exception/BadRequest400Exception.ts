export class BadRequest400Exception extends Error {
  public readonly statusCode: number = 400;

  constructor(msg: string | undefined = undefined) {
    super(`BadRequest400Exception${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BadRequest400Exception.prototype);
  }
}
