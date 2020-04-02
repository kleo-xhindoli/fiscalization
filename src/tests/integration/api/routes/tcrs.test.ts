import request from 'supertest';
import app, { initializeServer, initializeMockSOAP } from '../../setup-tests';
import { Server } from 'http';
import { privateKey, certificate } from '../../../__test-data__/keys';

import add from 'date-fns/add';
import { addDays, subDays } from 'date-fns';

describe('Integration | TCR Routes', () => {
  const MAGNUM_API_KEY = 'tky3um15444ffcPPcMF';
  let server: Server | null = null;

  beforeAll(async done => {
    try {
      server = initializeServer();
      await initializeMockSOAP();
      done();
    } catch (e) {
      console.error('Failed to init server!');
      console.log(e);
      done(e);
    }
  });

  afterAll(async done => {
    await server?.close();
    done();
  });

  describe('/api/tcrs/registerTCR', () => {
    it('should send a 401 when auth is missing', async () => {
      expect.assertions(1);
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(401);
    });

    it('should respond with the created TCR number on a valid POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body.tcrCode).toBeDefined();
      expect(res.body.body.businUnitCode).toBe('bb123bb123');
      expect(res.body.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.body.tcrIntID).toBe('1');
      expect(res.body.body.softCode).toBeUndefined();
    });

    it(`should respond with the created TCR number on a valid POST request
      when validFrom and validTo are present`, async () => {
      const now = new Date();
      const validFrom = now.toISOString();
      const validTo = addDays(now, 90).toISOString();

      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
            validFrom,
            validTo,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body.tcrCode).toBeDefined();
      expect(res.body.body.businUnitCode).toBe('bb123bb123');
      expect(res.body.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.body.tcrIntID).toBe('1');
      expect(res.body.body.validFrom).toBeDefined();
      expect(res.body.body.validTo).toBeDefined();
    });

    it(`should respond with 400 if validFrom is in the past`, async () => {
      const now = new Date();
      const validFrom = subDays(now, 1).toISOString();
      const validTo = addDays(now, 90).toISOString();

      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
            validFrom,
            validTo,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 200 if validTo is in the past (deactivate TCR)`, async () => {
      const now = new Date();
      const validTo = subDays(now, 1).toISOString();

      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
            validTo,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
    });

    it(`should respond with 400 if validTo is before validFrom`, async () => {
      const now = new Date();
      const validFrom = addDays(now, 3);
      const validTo = subDays(validFrom, 1);

      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if any of the required fields are missing', async () => {
      // Missing businessUnitCode
      let res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            issuerNUIS: 'I12345678I',
            tcrIntID: '1',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);

      // Missing issuerNUIS
      res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            tcrIntID: '1',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);

      // Missing tcrIntID
      res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            regDateTime: new Date().toUTCString(),
            tcrIntID: '1',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is in the future', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            businUnitCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            regDateTime: date,
            tcrIntID: '1',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });
  });

  describe('/api/tcrs/cashBalance', () => {
    it('should send a 401 when auth is missing', async () => {
      expect.assertions(1);
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(401);
    });

    it('should respond with 200 and the request body on a valid INITIAL POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.tcrCode).toBe('bb123bb123');
      expect(res.body.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.body.changeDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.body.operation).toBe('INITIAL');
      expect(res.body.body.cashAmt).toBe(2000);
    });

    it('should respond with 200 and the request body on a valid negative INOUT POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INOUT',
            cashAmt: -200,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.operation).toBe('INOUT');
      expect(res.body.body.cashAmt).toBe(-200);
    });

    it('should respond with 200 and the request body on a valid INOUT positive POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INOUT',
            cashAmt: 200,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.operation).toBe('INOUT');
      expect(res.body.body.cashAmt).toBe(200);
    });

    it('should respond with 200 and the request body on a valid subsequent POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
            cashAmt: 2000,
            isSubseqDeliv: true,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.tcrCode).toBe('bb123bb123');
      expect(res.body.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.body.changeDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.body.operation).toBe('INITIAL');
      expect(res.body.body.cashAmt).toBe(2000);
      expect(res.body.body.isSubseqDeliv).toBe(true);
    });

    it('should respond with 400 if operation is INITIAL and cashAmt is negative', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
            cashAmt: -200,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if any of the required fields are missing', async () => {
      let res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: '2019-09-03T14:37:31+02:00',
            operation: 'INITIAL',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: new Date().toUTCString(),
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is in the future', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: date,
            operation: 'INITIAL',
            cashAmt: 2000,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if operation is not Balance, Deposit or Credit', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: date,
            operation: 'Withdraw',
            cashAmt: 2000.0,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if cashAmt is a negative number', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            tcrCode: 'bb123bb123',
            issuerNUIS: 'I12345678I',
            changeDateTime: date,
            operation: 'Withdraw',
            cashAmt: -1,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });
  });
});
