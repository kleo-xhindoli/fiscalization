import config from '../../config';
import logger from '../../api/config/logger';
import app from '../../api/config/express';
import initSoap from '../../api/config/soap';

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
  // TODO
}

export default app;
