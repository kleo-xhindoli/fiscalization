import config from '../../config';
import logger from '../../api/config/logger';
import app from '../../api/config/express';
import initSoap from '../../api/config/soap';
import nock from 'nock';
import { join as joinPath } from 'path';
const { port, env } = config;

function mockWSLD() {
  const wsdl = joinPath(__dirname, './__mocks__/fiscalization-wsdl.xml');
  nock(config.fiscEndpoint)
    .get('/FiscalizationService.wsdl')
    .replyWithFile(200, wsdl, {
      'Content-Type': 'text/xml',
      'Keep-Alive': 'timeout=5, max=100',
      Connection: 'Keep-Alive',
      'Transfer-Encoding': 'chunked',
    })
    .persist();

  const alimc = joinPath(__dirname, './__mocks__/fiscalization-wsdl.xml');
  nock(config.fiscEndpoint)
    .get('/alimc-fiscalization-service.xsd')
    .replyWithFile(200, alimc, {
      'Content-Type': 'text/xml',
      'Keep-Alive': 'timeout=5, max=100',
      Connection: 'Keep-Alive',
      'Transfer-Encoding': 'chunked',
    })
    .persist();
}

export function initializeServer() {
  return app.listen(port, () => {
    logger.info(`server started on port ${port} (${env})`);
  });
}

export async function initializeSOAP() {
  // mockWSLD();
  // TODO: fix this
  const client = await initSoap();
  logger.info('SOAP Initialized');
  return client;
}

export default app;
