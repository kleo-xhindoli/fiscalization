import { Response } from 'express';
import { NextFn } from '../../types';
import { authorize } from '../../services/Auth.service';
import Boom from 'boom';

export default function auth(req: any, res: Response, next: NextFn) {
  const apiKey = req.header('X-Api-Key');
  if (!apiKey)
    return next(Boom.unauthorized('Authorization header is missing'));

  try {
    req.authClient = authorize(apiKey);
    next();
  } catch (e) {
    next(Boom.unauthorized('Invalid api key'));
  }
}