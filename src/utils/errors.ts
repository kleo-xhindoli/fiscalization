import { SOAPRequestObject } from '../types';

export class BaseError extends Error {
  type = this.constructor.name;
}

export class InvalidApiKey extends BaseError {
  constructor() {
    super('Invalid api key');
  }
}

export class MissingSoapClientError extends BaseError {
  constructor() {
    super("SOAP Client hasn't been initialized.");
  }
}

export class FiscalizationError extends BaseError {
  constructor(public error: any, public request: SOAPRequestObject) {
    super('Fiscalization failed!');
  }
}
