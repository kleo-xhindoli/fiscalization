import { Client, createClientAsync } from 'soap';
import config from '../../config';

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
    ],
  },
};

let _client: null | Client = null;

export default async function init() {
  const client = (await createClientAsync(wsdlUrl, clientConfig)) as Client;
  client.setEndpoint(serviceUrl);
  _client = client;
  return client;
}

export function getClient() {
  return _client;
}
