import { registerTCR, cashBalance } from '../../../services/TCR.service';
import { addDays } from 'date-fns';

describe('Unit | Service | TCR', () => {
  describe('registerTCR', () => {
    it('registers a new TCR', async () => {
      const res = await registerTCR({
        businUnitCode: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        tcrIntID: 1,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body.tcrCode).toBeDefined();
      expect(res.body.businUnitCode).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.tcrIntID).toBe(1);
    });

    it('registers a new TCR when validTo and validFrom fields are present', async () => {
      const now = new Date();
      const validFrom = now.toISOString();
      const validTo = addDays(now, 90).toISOString();
      const res = await registerTCR({
        businUnitCode: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        tcrIntID: 1,
        validFrom,
        validTo,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body.tcrCode).toBeDefined();
      expect(res.body.businUnitCode).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.tcrIntID).toBe(1);
      expect(res.body.validFrom).toBe(validFrom);
      expect(res.body.validTo).toBe(validTo);
    });
  });

  describe('cashBalance', () => {
    it('registers the cash balance INITIAL operation', async () => {
      const res = await cashBalance({
        tcrCode: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        changeDateTime: '2019-09-03T14:37:31+02:00',
        operation: 'INITIAL',
        cashAmt: 2000,
        isSubseqDeliv: false,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body).toBeDefined();
      expect(res.body.tcrCode).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.changeDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.operation).toBe('INITIAL');
      expect(res.body.cashAmt).toBe(2000);
      expect(res.body.FCDC).toBeDefined();
      expect(res.body.isSubseqDeliv).toBe(false);
    });

    it('registers the cash balance INOUT operation with positive amount', async () => {
      const res = await cashBalance({
        tcrCode: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        changeDateTime: '2019-09-03T14:37:31+02:00',
        operation: 'INOUT',
        cashAmt: 2000,
        isSubseqDeliv: false,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body).toBeDefined();
      expect(res.body.tcrCode).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.changeDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.operation).toBe('INOUT');
      expect(res.body.cashAmt).toBe(2000);
      expect(res.body.FCDC).toBeDefined();
      expect(res.body.isSubseqDeliv).toBe(false);
    });

    it('registers the cash balance INOUT operation with negative amount', async () => {
      const res = await cashBalance({
        tcrCode: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        changeDateTime: '2019-09-03T14:37:31+02:00',
        operation: 'INOUT',
        cashAmt: -2000,
        isSubseqDeliv: false,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body).toBeDefined();
      expect(res.body.tcrCode).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.changeDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.operation).toBe('INOUT');
      expect(res.body.cashAmt).toBe(-2000);
      expect(res.body.FCDC).toBeDefined();
      expect(res.body.isSubseqDeliv).toBe(false);
    });

    it('registers a subsequent cash balance', async () => {
      const res = await cashBalance({
        tcrCode: 'bb123bb123',
        issuerNUIS: 'I12345678I',
        changeDateTime: '2019-09-03T14:37:31+02:00',
        operation: 'INOUT',
        cashAmt: -2000,
        isSubseqDeliv: true,
      });

      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();

      expect(res.body).toBeDefined();
      expect(res.body.tcrCode).toBe('bb123bb123');
      expect(res.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.changeDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.operation).toBe('INOUT');
      expect(res.body.cashAmt).toBe(-2000);
      expect(res.body.FCDC).toBeDefined();
      expect(res.body.isSubseqDeliv).toBe(true);
    });
  });
});
