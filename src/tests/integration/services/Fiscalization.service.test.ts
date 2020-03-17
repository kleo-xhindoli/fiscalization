import { Client } from 'soap';
import { initializeSOAP } from '../setup-tests';
import { sendRegisterTCRRequest } from '../../../services/Fiscalization.service';
import { generateFiscHeaders } from '../../../utils/fiscHeaders';
import {
  privateKey as key,
  certificate as cert,
} from '../../__test-data__/keys';

describe('Integration | Service | Fiscalization', () => {
  let client: Client | null = null;
  beforeAll(async done => {
    try {
      jest.setTimeout(30000);
      client = await initializeSOAP();
      console.log('INITIALIZED CLIENT');
      done();
    } catch (e) {
      console.log('Failed to init SOAP', e);
      done(e);
    }
  });

  describe('sendRegisterTCRRequest', () => {
    xit('should send the correct RegisterTCRRequest', async () => {
      const req = {
        header: generateFiscHeaders(),
        body: {
          businUnitCode: 'ns187ov411',
          issuerNUIS: 'L41323036D',
          maintainerCode: 'pa979rk772',
          softCode: 'rm039uu671',
          tcrIntID: 1,
        },
      };
      try {
        const res = await sendRegisterTCRRequest(req, key, cert);
        console.log(JSON.stringify(res));
      } catch (e) {
        console.log(client?.lastRequest);
      }
    });
  });
});
