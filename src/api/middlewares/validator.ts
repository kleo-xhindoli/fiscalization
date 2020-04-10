import { Response } from 'express';
import joi, { attempt, object, string, Schema } from '@hapi/joi';
import { NextFn } from '../../types';
import Boom from '@hapi/boom';

import {
  InvalidRSAPrivateKeyError,
  InvalidCertificateError,
  CertificateExpiredError,
  InvalidCertificateIssuerError,
  KeyDoesNotMatchCertError,
  SchemaValidationError,
} from '../../utils/errors';
import { validateCryptoIntegrity } from '../../utils/crypto-utils';

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

export function validateCertificates(req: any, res: Response, next: NextFn) {
  try {
    const { privateKey, certificate } = validateCertificateSchema(req.body);
    req.body = req.body.payload; // Other endpoints don't have to worry about the certs
    req.certificate = certificate;
    req.privateKey = privateKey;

    // TODO: Skip this for Magnum
    validateCryptoIntegrity(certificate, privateKey);
    next();
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      next(Boom.forbidden('Certificates are missing from body.'));
    } else if (e instanceof InvalidRSAPrivateKeyError) {
      next(Boom.forbidden('Invalid Private Key'));
    } else if (e instanceof InvalidCertificateError) {
      next(Boom.forbidden('Invalid Certificate'));
    } else if (e instanceof CertificateExpiredError) {
      next(Boom.forbidden('Certificate has expired'));
    } else if (e instanceof InvalidCertificateIssuerError) {
      next(Boom.forbidden('Certificate not issued by NAIS'));
    } else if (e instanceof KeyDoesNotMatchCertError) {
      next(Boom.forbidden('Private Key does not match provided Certificate'));
    } else {
      next(Boom.boomify(e));
    }
  }
}
