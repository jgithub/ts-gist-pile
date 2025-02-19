export class ProgrammerErrorException extends Error {
  constructor(msg: string | undefined = undefined) {
    super(`ProgrammerErrorException${msg ? ': ' + msg : ''}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ProgrammerErrorException.prototype);
  }
}
