import { Client, createClientAsync } from 'soap';
import config from '../../config';
import logger from './logger';
import request from 'request';

const waitForSecondsAsync = (sec: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
};

const requestWithDefaults = request.defaults({ rejectUnauthorized: false });
const wsdlUrl = `${config.fiscEndpoint}/FiscalizationService.wsdl`;
const serviceUrl = `${config.fiscEndpoint}/`;
const clientConfig = {
  envelopeKey: 'SOAP-ENV',

  overrideRootElement: {
    namespace: '',
    xmlnsAttributes: [
      {
        name: 'xmlns',
        value: 'https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema',
      },
      {
        name: 'xmlns:ns2',
        value: 'http://www.w3.org/2000/09/xmldsig#',
      },
      {
        name: 'Id',
        value: 'Request',
      },
      {
        name: 'Version',
        value: '2',
      },
    ],
  },
  ignoredNamespaces: {
    namespaces: ['al', 'als', 'ns1'],
    override: true,
  },
  request: requestWithDefaults,
};

let _client: null | Client = null;

export default async function init() {
  const setup = async () => {
    const client = (await createClientAsync(wsdlUrl, clientConfig)) as Client;
    client.setEndpoint(serviceUrl);
    _client = client;
    logger.info('[INFO | SOAP]: Connected to Fiscalization Service');
    return client;
  };
  try {
    return await setup();
  } catch (e) {
    /**
     * The test fiscalization service sometimes returns 404 when getting the
     * WSDL file for no reason. Attempt a retry after 2 seconds before failing.
     */
    logger.info(
      '[INFO | SOAP]: Failed to connect to WSDL. Retrying after 2 seconds.'
    );
    await waitForSecondsAsync(2);
    return await setup();
  }
}

export function getClient() {
  return _client;
}
