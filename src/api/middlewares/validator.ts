import { Response } from 'express';
import { validate, SchemaMap, object, string } from 'joi';
import { NextFn } from '../../types';
import Boom from '@hapi/boom';

export function validateBody(schema: SchemaMap) {
  return (req: any, res: Response, next: NextFn) => {
    const validationResult = validate(req.body, schema);
    req.validatedBody = validationResult.value;
    if (validationResult.error) {
      return next(validationResult.error);
    }
    next();
  };
}

export function validateQueryParams(schema: SchemaMap) {
  return (req: any, res: Response, next: NextFn) => {
    const validationResult = validate(req.query, schema);
    req.validatedQueryParams = validationResult.value;
    if (validationResult.error) {
      return next(validationResult.error);
    }
    next();
  };
}

export function validateCertificates(req: any, res: Response, next: NextFn) {
  const certificatesSchema = {
    payload: object().required(),
    certificates: object({
      privateKey: string().required(),
      certificate: string().required(),
    }).required(),
  };
  const validationResult = validate(req.body, certificatesSchema);
  if (validationResult.error) {
    return next(Boom.forbidden('Certificates are missing from body.'));
  }
  req.body = req.body.payload; // Other endpoints don't have to worry about the certs
  req.privateKey = validationResult.value.certificates.privateKey;
  req.certificate = validationResult.value.certificates.certificate;
  next();
}
