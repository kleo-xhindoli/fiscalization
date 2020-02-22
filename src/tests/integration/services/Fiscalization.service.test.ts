import { Client } from 'soap';
import { initializeSOAP } from '../setup-tests';
import { sendRegisterTCRRequest } from '../../../services/Fiscalization.service';
import { generateFiscHeaders } from '../../../utils/fiscHeaders';
import { key, cert } from './keys.pem';

describe('Integration | Service | Fiscalization', () => {
  let client: Client | null = null;
  // @ts-ignore
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
  beforeAll(async done => {
    try {
      client = await initializeSOAP();
      console.log('INITIALIZED CLIENT');
      done();
    } catch (e) {
      console.log('Failed to init SOAP', e);
      done(e);
    }
  });

  describe('sendRegisterTCRRequest', () => {
    it('should send the correct RegisterTCRRequest', async () => {
      const req = {
        header: generateFiscHeaders(),
        body: {
          businUnit: 'bb123bb123',
          issuerNUIS: 'J81609010U',
          manufacNum: 'mm123mm123',
          regDateTime: new Date().toISOString(),
          softNum: 'ss123ss123',
          tcrOrdNum: 1,
        },
      };
      try {
        const res = await sendRegisterTCRRequest(req, key, cert);
      } catch (e) {
        console.log(client?.lastRequest);
      }
    });
  });
});
