import request from 'supertest';
import app, { initializeServer, initializeMockSOAP } from '../../setup-tests';
import { Server } from 'http';
import { privateKey, certificate } from '../../../__test-data__/keys';

import add from 'date-fns/add';
import { addDays, subDays, subMinutes } from 'date-fns';
import { toCentralEuropeanTimezone } from '../../../../utils/date-utils';

const wtnPayload = {
  dateTimeCreated: '2020-04-13T20:42:00.352Z',
  wtnNum: 1232020,
  operatorCode: 'ax083bc420',
  businUnit: 'bg517kw842',
  startAddr: 'Rruga 1',
  startCity: 'Tirane',
  destinAddr: 'Rruga 2',
  destinCity: 'Durres',
  isAfterDel: false,
  transDate: '2020-04-13T20:42:00.352Z',
  carrierId: 'uniq-carrier',
  vehPlates: 'AA123PP',
  issuer: {
    nuis: 'L41323036D',
    name: 'John Doe',
  },
  items: [
    {
      name: 'Some Item',
      code: '123123',
      unit: 'piece',
      quantity: 1,
    },
  ],
};

describe('Integration | WTN Routes', () => {
  const MAGNUM_API_KEY = 'tky3um15444ffcPPcMF';
  let server: Server | null = null;

  beforeAll(async (done) => {
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

  afterAll(async (done) => {
    await server?.close();
    done();
  });

  describe('/api/wtns/registerWTN', () => {
    it('should send a 401 when auth is missing', async () => {
      expect.assertions(1);
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .send({
          payload: {
            ...wtnPayload,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(401);
    });

    it('should respond with the created WTN on a valid POST request', async () => {
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...wtnPayload,
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
      expect(res.body.body).toMatchObject({
        dateTimeCreated: '2020-04-13T22:42:00+02:00',
        wtnNum: 1232020,
        operatorCode: 'ax083bc420',
        businUnit: 'bg517kw842',
        startAddr: 'Rruga 1',
        startCity: 'Tirane',
        destinAddr: 'Rruga 2',
        destinCity: 'Durres',
        isAfterDel: false,
        transDate: '2020-04-13T22:42:00+02:00',
        carrierId: 'uniq-carrier',
        vehPlates: 'AA123PP',
        issuer: {
          nuis: 'L41323036D',
          name: 'John Doe',
        },
        items: [
          {
            name: 'Some Item',
            code: '123123',
            unit: 'piece',
            quantity: 1,
          },
        ],
        wtnic: '1810A28D31713ECAE6CC4648943CA37D',
        wtnicSignature:
          '1E81AA623B8D2740E19CBBFD32B0EA638D0B36ACD78EE2177BA0F74E659D960C2AE57A1497E879DE5F1998B2757996E812B815E435959C59E104046F3B3C69D312700E673E354B3717E75C5D2DA72ABEB60C1CF15354D6E87839DE5B2B52145CCBFCADCAA8E6CD1B6A4594AE6BBE5F7220A5205DE85B243C922F035911A2DE428CC2DC5E097E9354609EE84500793CB72424284C95749DCC53DCD34875307C2D68B0F4DFFE44548254891253097BFE5B00615A732F8A2D13D7C258642D0179608D0572F121949836E721116B8D6E590570F12A55FF42E0B5843233B05B3A6C116F5404B4882B7E668EA89887EF5D5BEBAC92E92F9453EB5C9525CF3020D01C4B',
      });

      expect(res.body.body.FWTNIC).toBeDefined();
    });

    it('should respond with 400 if dateTimeCreated is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...wtnPayload,
            dateTimeCreated: new Date().toDateString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if transDate is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...wtnPayload,
            transDate: new Date().toDateString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should convert the given dates to Europe/Berlin timezone', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...wtnPayload,
            dateTimeCreated: now.toISOString(),
            transDate: now.toISOString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.body.dateTimeCreated).toBe(
        toCentralEuropeanTimezone(now)
      );
      expect(res.body.body.transDate).toBe(toCentralEuropeanTimezone(now));
    });
  });
});
