import request from 'supertest';
import app, { initializeServer } from '../../setup-tests';
import { Server } from 'http';
import { privateKey, certificate } from '../../../__test-data__/keys';
import { addDays, subDays } from 'date-fns';

const payload = {
  isBadDebt: 'false',
  businUnitCode: 'bg517kw842',
  tcrCode: 'vb721zy972',
  dateTimeCreated: '2020-03-19T12:23:09.658Z',
  invOrdNum: 1,
  isSubseqDeliv: false,
  isIssuerInVAT: true,
  operatorCode: 'ax083bc420',
  payMethods: [
    {
      type: 'BANKNOTE',
    },
  ],
  isReverseCharge: false,
  typeOfInv: 'CASH',
  seller: {
    address: 'Rruga i ri 1',
    country: 'Albania',
    idType: 'NUIS',
    idNum: 'L91806031N',
    name: 'Coca-Cola LTD',
    town: 'Tirana',
  },
  items: [
    {
      code: '501234567890',
      name: 'Fanta',
      quantity: 1,
      rebate: 0,
      rebateReducingBasePrice: true,
      unitOfMeasure: 'piece',
      unitPrice: 199,
      VATRate: 20,
    },
    {
      code: '501234567890',
      name: 'Fanta',
      quantity: 1,
      rebate: 0,
      rebateReducingBasePrice: true,
      unitOfMeasure: 'piece',
      unitPrice: 199,
      VATRate: 16,
    },
  ],
};

describe('Integration | Invoice routes', () => {
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
  describe('/api/invoices/register', () => {
    it('should respond with 401 if no API key is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .send({
          ...payload,
        });
      expect(res.status).toBe(401);
    });

    it('should respond with 403 if no certificates are provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
        });
      expect(res.status).toBe(403);
    });

    it('should register an invoice if valid data is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload,
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
      expect(res.body.body.FIC).toBeDefined();
      expect(res.body.body).toMatchObject({
        isBadDebt: false,
        businUnitCode: 'bg517kw842',
        tcrCode: 'vb721zy972',
        dateTimeCreated: '2020-03-19T13:23:09+01:00',
        invOrdNum: 1,
        isSubseqDeliv: false,
        isIssuerInVAT: true,
        operatorCode: 'ax083bc420',
        payMethods: [
          {
            type: 'BANKNOTE',
          },
        ],
        isReverseCharge: false,
        typeOfInv: 'CASH',
        seller: {
          address: 'Rruga i ri 1',
          country: 'Albania',
          idType: 'NUIS',
          idNum: 'L91806031N',
          name: 'Coca-Cola LTD',
          town: 'Tirana',
        },
        items: [
          {
            code: '501234567890',
            name: 'Fanta',
            quantity: 1,
            rebate: 0,
            rebateReducingBasePrice: true,
            unitOfMeasure: 'piece',
            unitPrice: 199,
            unitPriceWithVAT: 238.8,
            VATRate: 20,
            priceBeforeVAT: 199,
            VATAmount: 39.8,
            priceAfterVAT: 238.8,
          },
          {
            code: '501234567890',
            name: 'Fanta',
            quantity: 1,
            rebate: 0,
            rebateReducingBasePrice: true,
            unitOfMeasure: 'piece',
            unitPriceWithVAT: 230.84,
            unitPrice: 199,
            VATRate: 16,
            priceBeforeVAT: 199,
            VATAmount: 31.84,
            priceAfterVAT: 230.84,
          },
        ],
        invNum: '1/2020/vb721zy972',
        totPriceWoVAT: 398,
        totVATAmt: 71.64,
        totPrice: 469.64,
        softCode: 'abc123',
        iic: 'BDD49A6928BF04AB5FCBEEB9CF5504F8',
        iicSignature:
          '605D54B1C9369FF16A5408A97F6F3416E94C77BF89DC8B986A59DDAD63121FC8551E8C2A5D823A12DFA254415CAAED4C91D9D0E15D911FB744B2BE2746797A5BCECA1A919FF1A4CE4ECFE85061EAB2D9B1E43BA5E93046711845F4A136BCAC2E075770DA5C8B02013EACEE5B5416E18BC423526E4ECB636652B2BF144D32B7C35D14A3DF41E8638EFE5B53D577314661D8C1711E9D782F79ED1DA83F462551550CA5EACE77888CCE08D98612B424B343E3969C7C95D7E4E27C07F598A54F05B7F8BD8F81C1870A45A8709AE2A5D5A84D0D17C92C9C934507E710164B4BB5AC228A87627610950FDEE0E7BCD134A32EC1948A7DAB2457435D53DF25CD22B1180E',
        sameTaxes: [
          {
            VATRate: 16,
            numOfItems: 1,
            priceBeforeVAT: 199,
            VATAmt: 31.84,
          },
          {
            VATRate: 20,
            numOfItems: 1,
            priceBeforeVAT: 199,
            VATAmt: 39.8,
          },
        ],
      });
    });

    it(`should respond with 200 when creating a non-cash invoice
      with valid data`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            typeOfInv: 'NON-CASH',
            cashRegister: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.header).toBeDefined();
      expect(res.body.body.invNum).toBe('1/2020');
    });

    it(`should respond with 200 when creating a selfIssuing
      invoice with valid data`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            typeOfSelfIss: 'DOMESTIC',
            buyer: {
              ...payload.seller,
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.header).toBeDefined();
      expect(res.body.body).toBeDefined();
    });

    it('should respond with 400 if any required fields are missing', async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            typeOfInv: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            dateTimeCreated: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            invOrdNum: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payMethods: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            operatorCode: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            businUnitCode: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            seller: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if typeOfSelfIss is not a valid type`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            typeOfSelfIss: 'Q',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if dateTimeCreated is not
      a valid iso string`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            dateTimeCreated: new Date().toUTCString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if invOrdNum is less than 1`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            invOrdNum: 0,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if typeOfInv is Cash and
      cashRegister is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            typeOfInv: 'CASH',
            tcrCode: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if payMethods is not a valid
      payment method`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payMethods: [
              {
                type: 'INVALID',
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if payMethods is not an array`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payMethods: {
              type: 'INVALID',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if payMethods is empty`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payMethods: [],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if typeOfSelfIss is defined and
      buyer info is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            typeOfSelfIss: 'AGREEMENT',
            buyer: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    // items
    it(`should respond with 400 if invoice items required 
      fields are missing`, async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            items: [
              {
                code: '501234567890',
                // name: 'Fanta',
                quantity: 1,
                rebate: 0,
                rebateReducingBasePrice: true,
                unitOfMeasure: 'piece',
                unitPrice: 199,
                VATRate: 20.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            items: [
              {
                code: '501234567890',
                name: 'Fanta',
                // quantity: 1,
                rebate: 0,
                rebateReducingBasePrice: true,
                unitOfMeasure: 'piece',
                unitPrice: 199,
                VATRate: 20.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            items: [
              {
                code: '501234567890',
                name: 'Fanta',
                quantity: 1,
                rebate: 0,
                rebateReducingBasePrice: true,
                unitOfMeasure: 'piece',
                // unitPrice: 199,
                VATRate: 20.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            items: [
              {
                code: '501234567890',
                name: 'Fanta',
                quantity: 1,
                rebate: 0,
                rebateReducingBasePrice: true,
                unitOfMeasure: 'piece',
                unitPrice: 199,
                // VATRate: 20.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if rebate is defined but 
      rebateReducingBasePrice is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            items: [
              {
                code: '501234567890',
                name: 'Fanta',
                quantity: 1,
                rebate: 20,
                rebateReducingBasePrice: undefined,
                unitOfMeasure: 'piece',
                unitPrice: 199,
                VATRate: 20.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if rebate is not defined but 
      rebateReducingBasePrice is`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            items: [
              {
                code: '501234567890',
                name: 'Fanta',
                quantity: 1,
                rebate: undefined,
                rebateReducingBasePrice: true,
                unitOfMeasure: 'piece',
                unitPrice: 199,
                VATRate: 20.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    // consTaxes
    it(`should respond with 400 if consTaxes
      is defined but required fields are missing`, async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            consTaxes: [
              {
                consTaxRate: 20.0,
                numOfItems: 1,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            consTaxes: [
              {
                consTaxRate: 20.0,
                priceBefConsTax: 14.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            consTaxes: [
              {
                numOfItems: 1,
                priceBefConsTax: 14.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 200 with valid consTaxes`, async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            consTaxes: [
              {
                consTaxRate: 20.0,
                numOfItems: 1,
                priceBefConsTax: 14.0,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.consTaxes).toMatchObject([
        {
          consTaxRate: 20,
          numOfItems: 1,
          priceBefConsTax: 14,
          consTaxAmount: 2.8,
        },
      ]);
    });

    // payDeadline
    it('responds with 200 if payDeadline is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payDeadline: addDays(new Date(), 2).toISOString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.payDeadline).toBeDefined();
    });

    it('responds with 400 if payDeadline is not a valid ISO date', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payDeadline: addDays(new Date(), 2).toDateString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it('responds with 400 if payDeadline is in the past', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            payDeadline: subDays(new Date(), 2).toISOString(),
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    // Currency
    it('responds with 200 if currency info is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            currency: {
              code: 'EUR',
              exRate: 122.33,
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.currency).toMatchObject({
        code: 'EUR',
        exRate: 122.33,
      });
    });

    // supplyDateOrPeriod
    it('responds with 200 if supplyDateOrPeriod range is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            supplyDateOrPeriod: {
              start: '2020-03-19T13:23:09+01:00',
              end: '2020-03-20T13:23:09+01:00',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.supplyDateOrPeriod).toMatchObject({
        start: '2020-03-19',
        end: '2020-03-20',
      });
    });

    it('responds with 200 if supplyDateOrPeriod moment is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            supplyDateOrPeriod: {
              start: '2020-03-19T13:23:09+01:00',
              end: '2020-03-19T13:23:09+01:00',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.supplyDateOrPeriod).toMatchObject({
        start: '2020-03-19',
        end: '2020-03-19',
      });
    });

    it('responds with 400 if supplyDateOrPeriod object is not valid', async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            supplyDateOrPeriod: {
              start: '2020-03-19T13:23:09+01:00',
              // end: '2020-03-19T13:23:09+01:00',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            supplyDateOrPeriod: {
              // start: '2020-03-19T13:23:09+01:00',
              end: '2020-03-19T13:23:09+01:00',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    // correctiveInvoice
    it('responds with 200 if correctiveInvoice type CORRECTIVE info is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            correctiveInvoice: {
              iicRef: '8A895FD61406F2EEDE79BDC8BFF11B96',
              issueDateTime: '2020-03-19T13:23:09+01:00',
              type: 'CORRECTIVE',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.correctiveInvoice).toMatchObject({
        iicRef: '8A895FD61406F2EEDE79BDC8BFF11B96',
        issueDateTime: '2020-03-19T13:23:09+01:00',
        type: 'CORRECTIVE',
      });
    });

    it('responds with 400 if correctiveInvoice date is not a valid ISO date', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            correctiveInvoice: {
              iicRef: '8A895FD61406F2EEDE79BDC8BFF11B96',
              issueDateTime: new Date().toDateString(),
              type: 'CORRECTIVE',
            },
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    // Fees
    it('responds with 200 if fees are provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            fees: [
              {
                type: 'PACK',
                amt: 240,
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.fees).toMatchObject([
        {
          type: 'PACK',
          amt: 240,
        },
      ]);

      expect(res.body.body.totPrice).toBe(709.64);
      expect(res.body.body.totPriceWoVAT).toBe(638);
    });

    // Summary Invoice
    it('responds with 200 if sumIICRefs are provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            sumIICRefs: [
              {
                iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
                issueDateTime: '2020-03-19T13:23:09+01:00',
              },
              {
                iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
                issueDateTime: '2020-03-19T13:23:09+01:00',
              },
            ],
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.body.sumIICRefs).toMatchObject([
        {
          iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
          issueDateTime: '2020-03-19T13:23:09+01:00',
        },
        {
          iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
          issueDateTime: '2020-03-19T13:23:09+01:00',
        },
      ]);
    });

    it('responds with 400 if issueDateTime inside sumIICRefs is not a valid ISO date', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            sumIICRefs: [
              {
                iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
                issueDateTime: new Date(
                  '2020-03-19T13:23:09+01:00'
                ).toDateString(),
              },
              {
                iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
                issueDateTime: '2020-03-19T13:23:09+01:00',
              },
            ],
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
