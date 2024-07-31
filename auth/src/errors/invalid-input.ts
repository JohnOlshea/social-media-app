import { BaseCustomError } from './base-custom-error';

export class InvalidInput extends BaseCustomError {
  statusCode = 422;

  constructor() {
    super('User input does not match validation criteria');
    Object.setPrototypeOf(this, InvalidInput.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): unknown {
    return undefined;
  }
}
