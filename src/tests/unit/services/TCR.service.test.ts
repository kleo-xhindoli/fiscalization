import { registerTCR, cashBalance } from '../../../services/TCR.service';

describe('Unit | Service | TCR', () => {
  describe('registerTCR', () => {
    it('registers a new TCR', async () => {
      const res = await registerTCR({
        businUnit: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        regDateTime: '2019-09-03T14:37:31+02:00',
        tcrOrdNum: 1,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body.tcrNumber).toBeDefined();
      expect(res.body.businUnit).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.regDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.tcrOrdNum).toBe(1);
    });
  });

  describe('cashBalance', () => {
    it('registers the cash balance operation', async () => {
      const res = await cashBalance({
        tcrNumber: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        balChkDatTim: '2019-09-03T14:37:31+02:00',
        operation: 'Balance',
        cashAmt: 2000,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body).toBeDefined();
      expect(res.body.tcrNumber).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.balChkDatTim).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.operation).toBe('Balance');
      expect(res.body.cashAmt).toBe(2000);
    });
  });
});
