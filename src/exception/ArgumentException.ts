export class ArgumentException extends Error {
  constructor(msg: string | undefined = undefined) {
    super(`ArgumentException${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ArgumentException.prototype);
  }
}
