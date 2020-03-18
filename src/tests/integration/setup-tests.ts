import config from '../../config';
import logger from '../../api/config/logger';
import app from '../../api/config/express';
import initSoap, { getClient } from '../../api/config/soap';
import mockClient from './__mocks__/soap-client';
import { Client } from 'soap';
const { port, env } = config;

export function initializeServer() {
  return app.listen(port, () => {
    logger.info(`server started on port ${port} (${env})`);
  });
}

export async function initializeSOAP() {
  const client = await initSoap();
  logger.info('SOAP Initialized');
  return client;
}

export async function initializeMockSOAP() {
  const client = mockClient as any;
  logger.info('Mock SOAP Initialized');
  // @ts-ignore
  getClient = jest.fn().mockReturnValue(client);
  return client as Client;
}

export default app;
