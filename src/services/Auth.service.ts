import config from '../config';
import { Client } from '../types';
import { InvalidApiKey } from '../utils/errors';

export function authorize(givenApiKey: string): Client {
  if (config.clients.hasOwnProperty(givenApiKey)) {
    return config.clients[givenApiKey];
  }

  throw new InvalidApiKey();
}