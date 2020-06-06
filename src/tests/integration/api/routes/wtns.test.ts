import request from 'supertest';
import app, { initializeServer, initializeMockSOAP } from '../../setup-tests';
import { Server } from 'http';
import { privateKey, certificate } from '../../../__test-data__/keys';
import { toCentralEuropeanTimezone } from '../../../../utils/date-utils';
import { RegisterWarehouseTransferNoteRequest } from '../../../../types';

const wtnPayload: RegisterWarehouseTransferNoteRequest = {
  wtnType: 'WTN',
  groupOfGoods: 'FUEL',
  transaction: 'SALES',
  issueDateTime: '2020-04-13T20:42:00.352Z',
  operatorCode: 'ax083bc420',
  businUnitCode: 'bg517kw842',
  wtnOrdNum: 1,
  wtnNum: '1/2020',
  fuelPumNum: 'test',

  totPriceWoVAT: 4000,
  totVATAmt: 200,
  totPrice: 4200,

  vehOwnership: 'OWNER',
  vehPlates: 'AA200GG',

  startAddr: 'Rruga 3',
  startCity: 'Durres',
  startPoint: 'WAREHOUSE',
  startDateTime: '2020-04-13T20:42:00.352Z',
  destinAddr: 'Rruga 6',
  destinCity: 'Tirane',
  destinPoint: 'STORE',
  destinDateTime: '2020-04-13T22:42:00.352Z',

  isGoodsFlammable: true,
  isEscortRequired: false,

  packType: 'liquid tank',
  packNum: 1,
  itemsNum: 1,
  isAfterDel: false,
  issuer: {
    nuis: 'L41323036D',
    name: 'Oil SHPK',
    address: 'Rruga 16',
    town: 'Tirane',
  },

  // carrier: {
  //   idNum: 'K21239067K',
  //   idType: 'ID',
  //   name: 'John Doe',
  // },

  items: [
    {
      name: 'Oil',
      code: '123123',
      unit: 'litre',
      quantity: 200,
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
        wtnType: 'WTN',
        groupOfGoods: 'FUEL',
        transaction: 'SALES',
        issueDateTime: '2020-04-13T22:42:00+02:00',
        operatorCode: 'ax083bc420',
        businUnitCode: 'bg517kw842',
        wtnOrdNum: 1,
        wtnNum: '1/2020',
        fuelPumNum: 'test',
        totPriceWoVAT: 4000,
        totVATAmt: 200,
        totPrice: 4200,
        vehOwnership: 'OWNER',
        vehPlates: 'AA200GG',
        startAddr: 'Rruga 3',
        startCity: 'Durres',
        startPoint: 'WAREHOUSE',
        startDateTime: '2020-04-13T22:42:00+02:00',
        destinAddr: 'Rruga 6',
        destinCity: 'Tirane',
        destinPoint: 'STORE',
        destinDateTime: '2020-04-14T00:42:00+02:00',
        isGoodsFlammable: true,
        isEscortRequired: false,
        packType: 'liquid tank',
        packNum: 1,
        itemsNum: 1,
        isAfterDel: false,
        issuer: {
          nuis: 'L41323036D',
          name: 'Oil SHPK',
          address: 'Rruga 16',
          town: 'Tirane',
        },
        items: [
          {
            name: 'Oil',
            code: '123123',
            unit: 'litre',
            quantity: 200,
          },
        ],
        wtnic: 'C8BB5B851F9A74DA917DA22166504A2A',
        wtnicSignature:
          '87B837307B858ADF7761F3D707009568748C7B8E10C4D338E316D46FAFAE199E5C306701D58EF9107768860FECDCA3FE119106B8C3C5727782870BC4DB180D0B64D61AAA3750E6A40EF071AAF3DBAF1419233FE2362D0C1E5B46AAAE7EA1A9A590F36A5A581FC098E5F6DA61F5321C559F4A3DA7028CE1D3D59DDD687404912A0CF85E9989C660D1E5A8FA0FEF5727BF6AF95B8D51423D13BB08AAFA3FCC83215DC1C99493E03C8EAEB6C2CDF042B855F243D3B64536A7C971CE9F50B67B4EEBC075AB12639B8609F246F84AE7200597CF35DD3CDD3C7EF7B5331AC5DEFE47DDC98C58973DFBB160BB5214AA1BA99D4B146F4C957F87D5943BFD90B246FAA781',
      });

      expect(res.body.body.FWTNIC).toBeDefined();
    });

    it('should respond with 400 if issueDateTime is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...wtnPayload,
            issueDateTime: new Date().toDateString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it('should respond with 400 if destinDateTime is not an ISO string', async () => {
      const res = await request(app)
        .post('/api/wtns/registerWTN')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...wtnPayload,
            destinDateTime: new Date().toDateString(),
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
            issueDateTime: now.toISOString(),
            destinDateTime: now.toISOString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.body.issueDateTime).toBe(toCentralEuropeanTimezone(now));
      expect(res.body.body.destinDateTime).toBe(toCentralEuropeanTimezone(now));
    });
  });
});
