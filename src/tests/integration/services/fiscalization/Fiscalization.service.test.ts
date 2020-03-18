import { Client } from 'soap';
import { initializeSOAP, initializeMockSOAP } from '../../setup-tests';
import {
  sendRegisterTCRRequest,
  sendTCRCashBalanceRequest,
} from '../../../../services/fiscalization';
import {
  generateFiscHeaders,
  generateSubsequentFiscHeaders,
} from '../../../../utils/fiscHeaders';
import {
  privateKey as key,
  certificate as cert,
} from '../../../__test-data__/keys';
import { toCentralEuropeanTimezone } from '../../../../utils/date-utils';
import { CashBalanceOperation } from '../../../../types';
import { subHours } from 'date-fns';

describe('Integration | Service | Fiscalization', () => {
  let client: Client | null = null;
  beforeAll(async done => {
    try {
      jest.setTimeout(30000);

      /** 
       * Uncomment the next line and comment the line after that to use online
       * Test Fiscalization Service
       */
      // client = await initializeSOAP();
      client = await initializeMockSOAP();
      done();
    } catch (e) {
      console.log('Failed to init SOAP', e);
      done(e);
    }
  });

  describe('sendRegisterTCRRequest', () => {
    it('should send the correct RegisterTCRRequest', async () => {
      const header = generateFiscHeaders();
      const req = {
        header,
        body: {
          businUnitCode: 'ns187ov411',
          issuerNUIS: 'L41323036D',
          maintainerCode: 'pa979rk772',
          softCode: 'rm039uu671',
          tcrIntID: 1,
        },
      };
      const res = await sendRegisterTCRRequest(req, key, cert);
      expect(res.body.tcrCode).toBeDefined();
      expect(res.header.UUID).toBeDefined;
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
    });
  });

  describe('sendTCRCashBalanceRequest', () => {
    it('should send the correct INITIAL TCRCashBalanceRequest', async () => {
      const header = generateSubsequentFiscHeaders(false);
      const req = {
        header,
        body: {
          changeDateTime: toCentralEuropeanTimezone(new Date()), // ISO
          cashAmt: 2000,
          issuerNUIS: 'L41323036D',
          operation: 'INITIAL' as CashBalanceOperation,
          tcrCode: 'vb721zy972',
        },
      };
      const res = await sendTCRCashBalanceRequest(req, key, cert);
      expect(res.body.FCDC).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
    });

    it('should send the correct INOUT TCRCashBalanceRequest with positive amount', async () => {
      const header = generateSubsequentFiscHeaders(false);
      const req = {
        header,
        body: {
          changeDateTime: toCentralEuropeanTimezone(new Date()), // ISO
          cashAmt: 400,
          issuerNUIS: 'L41323036D',
          operation: 'INOUT' as CashBalanceOperation,
          tcrCode: 'vb721zy972',
        },
      };
      const res = await sendTCRCashBalanceRequest(req, key, cert);

      expect(res.body.FCDC).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
    });

    it('should send the correct INOUT TCRCashBalanceRequest with negative amount', async () => {
      const header = generateSubsequentFiscHeaders(false);
      const req = {
        header,
        body: {
          changeDateTime: toCentralEuropeanTimezone(new Date()), // ISO
          cashAmt: -400,
          issuerNUIS: 'L41323036D',
          operation: 'INOUT' as CashBalanceOperation,
          tcrCode: 'vb721zy972',
        },
      };
      const res = await sendTCRCashBalanceRequest(req, key, cert);
      expect(res.body.FCDC).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
    });

    xit('should send a correct subsequent request with past date', async () => {
      // Does not work even though doc says it should ¯\_(ツ)_/¯
      // ERROR: Cash registration time differs from server time more than null minutes, difference is 240 minutes.

      const header = generateSubsequentFiscHeaders(true);
      const changeDateTime = toCentralEuropeanTimezone(subHours(new Date(), 4));

      const req = {
        header,
        body: {
          changeDateTime,
          cashAmt: -400,
          issuerNUIS: 'L41323036D',
          operation: 'INOUT' as CashBalanceOperation,
          tcrCode: 'vb721zy972',
        },
      };
      const res = await sendTCRCashBalanceRequest(req, key, cert);
      expect(res.body.FCDC).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
    });
  });
});
