export class ServiceUnavailable503Exception extends Error {
  public readonly statusCode: number = 503;

  constructor(msg: string | undefined = undefined) {
    super(`ServiceUnavailable503Exception${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServiceUnavailable503Exception.prototype);
  }
}
