import { Response, Request } from 'express';
import { NextFn } from '../../types';
import Boom = require('boom');

export function extractKeys(req: any, res: Response, next: NextFn) {
  const privateKey = req.header('X-Business-Private-Key');
  const certificate = req.header('X-Business-Certificate');
  if (!privateKey || !certificate)
    return next(
      Boom.unauthorized(
        'X-Business-Private-Key or X-Business-Certificate headers are missing'
      )
    );

  req.privateKey = privateKey;
  req.certificate = certificate;
  next();
}
