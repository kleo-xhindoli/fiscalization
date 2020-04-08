import { Response } from 'express';
import joi, { attempt, object, string, Schema } from '@hapi/joi';
import { NextFn } from '../../types';
import Boom from '@hapi/boom';
import RSA from 'node-rsa';

export function validateBody(schema: Schema) {
  return (req: any, res: Response, next: NextFn) => {
    try {
      const validationResult = attempt(req.body, schema);
      req.validatedBody = validationResult;
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function validateQueryParams(schema: Schema) {
  return (req: any, res: Response, next: NextFn) => {
    try {
      const validationResult = attempt(req.query, schema);
      req.validatedQueryParams = validationResult;
      next();
    } catch (e) {
      next(e);
    }
  };
}

class SchemaValidationError extends Error {
  constructor() {
    super('Certificate schema validation failed');
  }
}

class InvalidRSAPrivateKeyError extends Error {
  constructor() {
    super('Invalid RSA Private Key');
  }
}

const validateCertificateSchema = (body: any) => {
  const certificatesSchema = joi.object({
    payload: object().required(),
    certificates: object({
      privateKey: string().required(),
      certificate: string().required(),
    }).required(),
  });

  try {
    const validationResult = attempt(body, certificatesSchema);
    const privateKey = validationResult.certificates.privateKey;
    const certificate = validationResult.certificates.certificate;
    return { privateKey, certificate };
  } catch (e) {
    throw new SchemaValidationError();
  }
};

const validatePrivateKey = (privateKey: string) => {
  // TODO: Skip this for Magnum
  try {
    new RSA(privateKey);
  } catch (e) {
    throw new InvalidRSAPrivateKeyError();
  }
};

export function validateCertificates(req: any, res: Response, next: NextFn) {
  try {
    const { privateKey, certificate } = validateCertificateSchema(req.body);
    req.body = req.body.payload; // Other endpoints don't have to worry about the certs
    req.certificate = certificate;
    req.privateKey = privateKey;
    validatePrivateKey(privateKey);
    next();
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      next(Boom.forbidden('Certificates are missing from body.'));
    } else if (e instanceof InvalidRSAPrivateKeyError) {
      next(Boom.forbidden('Invalid Private Key'));
    }
  }
}
