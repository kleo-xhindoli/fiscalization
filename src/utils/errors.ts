export class BaseError extends Error {
  type = this.constructor.name;
}

export class InvalidApiKey extends BaseError {
  constructor() {
    super('Invalid api key');
  }
}
