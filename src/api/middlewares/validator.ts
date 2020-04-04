import { Response } from 'express';
import joi, { attempt, object, string, Schema } from '@hapi/joi';
import { NextFn } from '../../types';
import Boom from '@hapi/boom';

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

export function validateCertificates(req: any, res: Response, next: NextFn) {
  const certificatesSchema = joi.object({
    payload: object().required(),
    certificates: object({
      privateKey: string().required(),
      certificate: string().required(),
    }).required(),
  });

  try {
    const validationResult = attempt(req.body, certificatesSchema);
    req.body = req.body.payload; // Other endpoints don't have to worry about the certs
    req.privateKey = validationResult.certificates.privateKey;
    req.certificate = validationResult.certificates.certificate;
    next();
  } catch (e) {
    next(Boom.forbidden('Certificates are missing from body.'));
  }
}
