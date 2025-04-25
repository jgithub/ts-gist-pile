export class NotImplementedException extends Error {
  constructor(msg: string | undefined = undefined) {
    super(`NotImplementedException${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotImplementedException.prototype);
  }
}
