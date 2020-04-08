import { SOAPRequestObject } from '../types';

export class BaseError extends Error {
  type = this.constructor.name;
}

export class InvalidApiKey extends BaseError {
  constructor() {
    super('Invalid api key');
  }
}

export class InvalidPrivateKey extends BaseError {
  constructor() {
    super('Invalid private key');
  }
}

export class MissingSoapClientError extends BaseError {
  constructor() {
    super("SOAP Client hasn't been initialized.");
  }
}

export class FiscalizationError extends BaseError {
  constructor(public error: any) {
    super('Fiscalization failed!');
  }
}

export class ClientFiscalizationError extends FiscalizationError {
  constructor(error: any) {
    super(error);
  }
}

export class ServerFiscalizationError extends FiscalizationError {
  constructor(error: any) {
    super(error);
  }
}

export class InvalidRSAPrivateKeyError extends Error {
  constructor() {
    super('Invalid RSA Private Key');
  }
}

export class InvalidCertificateError extends Error {
  constructor() {
    super('Invalid Certificate');
  }
}

export class InvalidCertificateIssuerError extends Error {
  constructor() {
    super('Invalid Certificate');
  }
}

export class CertificateExpiredError extends Error {
  constructor() {
    super('Certificate has expired');
  }
}

export class KeyDoesNotMatchCertError extends Error {
  constructor() {
    super('Certificate does not match provided Private Key');
  }
}
