import request from 'supertest';
import app, { initializeServer } from '../../setup-tests';
import { Server } from 'http';

import add from 'date-fns/add';

describe('Integration | TCR Routes', () => {
  const MAGNUM_API_KEY = 'tky3um15444ffcPPcMF';
  let server: Server | null = null;

  beforeAll(async done => {
    try {
      server = initializeServer();
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
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          regDateTime: '2019-09-03T14:37:31+02:00',
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(401);
    });

    it('should respond with the created TCR number on a valid POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          regDateTime: '2019-09-03T14:37:31+02:00',
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body.tcrNumber).toBeDefined();
      expect(res.body.body.businUnit).toBe('bb123bb123');
      expect(res.body.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.body.regDateTime).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.body.tcrOrdNum).toBe(1);
    });

    it('should respond with 400 if any of the required fields are missing', async () => {
      let res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          issuerNUIS: 'I12345678I',
          regDateTime: '2019-09-03T14:37:31+02:00',
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          businUnit: 'bb123bb123',
          regDateTime: '2019-09-03T14:37:31+02:00',
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          regDateTime: '2019-09-03T14:37:31+02:00',
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          regDateTime: new Date().toUTCString(),
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is in the future', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/registerTCR')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          regDateTime: date,
          tcrOrdNum: 1,
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
          businUnit: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          regDateTime: '2019-09-03T14:37:31+02:00',
          tcrOrdNum: 1,
        });

      expect(res.status).toBe(401);
    });

    it('should respond with 200 and the request body on a valid Balance POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          operation: 'Balance',
          cashAmt: 2000,
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.tcrNumber).toBe('bb123bb123');
      expect(res.body.body.issuerNUIS).toBe('I12345678I');
      expect(res.body.body.balChkDatTim).toBe('2019-09-03T14:37:31+02:00');
      expect(res.body.body.operation).toBe('Balance');
      expect(res.body.body.cashAmt).toBe(2000);
    });

    it('should respond with 200 and the request body on a valid Deposit POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          operation: 'Deposit',
          cashAmt: 200,
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();

      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.operation).toBe('Deposit');
    });

    it('should respond with 200 and the request body on a valid Credit POST request', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          operation: 'Credit',
          cashAmt: 200,
        });

      expect(res.status).toBe(200);
      // header
      expect(res.body.header.sendDateTime).toBeDefined();
      expect(res.body.header.UUID).toBeDefined();
      expect(res.body.header.requestUUID).toBeDefined();
      
      // body
      expect(res.body.body).toBeDefined();
      expect(res.body.body.operation).toBe('Credit');
    });

    it('should respond with 400 if any of the required fields are missing', async () => {
      let res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          issuerNUIS: 'I12345678I',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          operation: 'Balance',
          cashAmt: 2000,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          operation: 'Balance',
          cashAmt: 2000,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          operation: 'Balance',
          cashAmt: 2000,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          cashAmt: 2000,
        });

      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: '2019-09-03T14:37:31+02:00',
          operation: 'Balance',
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: new Date().toUTCString(),
          operation: 'Balance',
          cashAmt: 2000,
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if regDateTime is in the future', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: date,
          operation: 'Balance',
          cashAmt: 2000,
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if operation is not Balance, Deposit or Credit', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: date,
          operation: 'Withdraw',
          cashAmt: 2000.0,
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if cashAmt is a negative number', async () => {
      const date = add(new Date(), { hours: 1 }).toISOString();
      const res = await request(app)
        .post('/api/tcrs/cashBalance')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          tcrNumber: 'bb123bb123',
          issuerNUIS: 'I12345678I',
          balChkDatTim: date,
          operation: 'Withdraw',
          cashAmt: -1,
        });

      expect(res.status).toBe(400);
    });
  });
});
