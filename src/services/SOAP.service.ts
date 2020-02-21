import * as soap from 'soap';
import uuid from 'uuid/v4';
import { WSSecurityCert } from './CustomWSSecurityCert';
import fs from 'fs';
import { formatToTimeZone } from 'date-fns-timezone';

// @ts-ignore
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// var url = 'https://www.crcind.com/csp/samples/SOAP.Demo.CLS?WSDL=1';
var url =
  'https://efiskalizimi-test.tatime.gov.al/FiscalizationService-v1/FiscalizationService.wsdl';
var args = { name: 'value' };

var _client: any = null;

const key = fs.readFileSync(__dirname + '/privateKey.pem', 'utf8');
const cert = fs.readFileSync(__dirname + '/publicCert.pem', 'utf8');

soap
  .createClientAsync(url, {
    envelopeKey: 'SOAP-ENV',
    overrideRootElement: {
      namespace: '',
      xmlnsAttributes: [
        {
          name: 'xmlns',
          value:
            'https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema',
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
  })
  .then(async (client: soap.Client) => {
    // client.addSoapHeader('');
    client.setEndpoint(
      'https://efiskalizimi-test.tatime.gov.al/FiscalizationService-v1/'
    );
    const sec = new WSSecurityCert(key, cert, '', {
      hasTimeStamp: false,
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      signerOptions: {
        prefix: '',
        attrs: { Id: 'Request' },
      },
    });
    client.setSecurity(sec);
    const dateUTC = new Date().toISOString();
    const date = formatToTimeZone(dateUTC, 'YYYY-MM-DDTHH:mm:ss[Z]', {
      timeZone: 'Europe/Berlin',
    });
    try {
      _client = client;
      const res = await client.registerTCRAsync({
        // const res = await client.AddIntegerAsync({
        ':Header': {
          attributes: {
            SendDateTime: date,
            UUID: uuid(),
          },
        },
        ':TCR': {
          attributes: {
            BusinUnit: 'bg517kw842',
            // IssuerNUIS: 'I12345678I',
            IssuerNUIS: 'J81609010U',
            ManufacNum: 'mm123mm123',
            RegDateTime: date,
            SoftNum: 'ss123ss123',
            TCROrdNum: 1,
          },
        },
      });
      console.log('request:');
      // console.log(JSON.stringify(res));
    } catch (e) {
      console.log('ERROR');
      console.log(e);
      // @ts-ignore
      console.log(_client.lastRequest);
    }
    console.log('done');
  });
