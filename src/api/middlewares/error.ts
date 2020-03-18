import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import config from '../../config';
import { NextFn } from '../../types';
import logger from '../config/logger';
import {
  ClientFiscalizationError,
  ServerFiscalizationError,
  FiscalizationError,
} from '../../utils/errors';

export function handler(err: any, req: Request, res: Response) {
  const { statusCode } = err.output || 500;
  const response = {
    status: statusCode,
    message: err.message || 'Server Error',
    error: err.output.payload.error || undefined,
    stack: statusCode === 500 ? err.stack : undefined,
    data: err.data ? { ...err.data } : undefined,
  };

  if (config.env !== 'development') {
    delete response.stack;
  }

  res.status(response.status);
  res.json(response);

  // Log 5XX errors
  if (response.status >= 500 && config.env !== 'test') {
    logger.error('[ERROR | MIDDLEWARE | ERROR] Unhandled 500 error', err);
  }
}

export function converter(err: any, req: Request, res: Response, next: NextFn) {
  if (!err) return next();

  if (err.isJoi) {
    const error = Boom.badRequest(err.message);
    return handler(error, req, res);
  }

  if (err instanceof ClientFiscalizationError) {
    const error = Boom.badRequest(err.error.faultstring, {
      isFiscalization: true,
      fault: 'Client',
      ...err.error.detail,
    });
    return handler(error, req, res);
  }

  if (err instanceof ServerFiscalizationError) {
    const error = Boom.badImplementation(err.error.faultstring, {
      isFiscalization: true,
      fault: 'Server',
      ...err.error.detail,
    });
    return handler(error, req, res);
  }

  if (err instanceof FiscalizationError) {
    const error = Boom.badImplementation(err.error, {
      isFiscalization: true,
      fault: 'Unknown',
      ...err.error?.detail,
    });
    return handler(error, req, res);
  }

  // JSON Parse error
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    const error = Boom.badRequest(err.message);
    return handler(error, req, res);
  }

  if (err.isBoom) {
    // Common Mongoose errors
    switch (err.name) {
      // Invalid Object Id cast error:
      case 'CastError': {
        const error = Boom.notFound(`${err.value} is not a valid ID!`);
        return handler(error, req, res);
      }

      default:
        return handler(err, req, res);
    }
  }

  const error = Boom.badImplementation(err.message || 'Server Error');
  return handler(error, req, res);
}

export function notFound(req: Request, res: Response) {
  const err = Boom.notFound();
  handler(err, req, res);
}
