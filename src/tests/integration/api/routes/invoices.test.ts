import request from 'supertest';
import app, { initializeServer } from '../../setup-tests';
import { Server } from 'http';
import { privateKey, certificate } from '../../../__test-data__/keys';

const payload = {
  badDebt: false,
  businUnit: 'bg517kw842',
  cashRegister: 'xb131ap287',
  dateTimeCreated: '2019-09-26T13:50:13+02:00',
  invOrdNum: 6,
  isSubseqDeliv: false,
  issuerInVAT: true,
  operatorCode: 'rf135zu420',
  paymentMeth: 'N',
  reverseCharge: 'false',
  selfIssuing: 'false',
  typeOfInv: 'C',
  issuer: {
    address: 'Rruga i ri 1',
    country: 'Albania',
    NUIS: 'L91806031N',
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
      VATRate: 20.0,
    },
    {
      code: '501234567890',
      name: 'Fanta',
      quantity: 1,
      rebate: 0,
      rebateReducingBasePrice: true,
      unitOfMeasure: 'piece',
      unitPrice: 199,
      VATRate: 16.0,
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
        badDebt: false,
        businUnit: 'bg517kw842',
        cashRegister: 'xb131ap287',
        dateTimeCreated: '2019-09-26T13:50:13+02:00',
        invOrdNum: 6,
        isSubseqDeliv: false,
        issuerInVAT: true,
        operatorCode: 'rf135zu420',
        paymentMeth: 'N',
        reverseCharge: false,
        selfIssuing: false,
        typeOfInv: 'C',
        issuer: {
          address: 'Rruga i ri 1',
          country: 'Albania',
          NUIS: 'L91806031N',
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
            unitPrice: 199,
            VATRate: 16,
            priceBeforeVAT: 199,
            VATAmount: 31.84,
            priceAfterVAT: 230.84,
          },
        ],
        taxFreeAmt: 0,
        invNum: '6/2020/xb131ap287',
        totPriceWoVAT: 398,
        totVATAmt: 71.64,
        totPrice: 469.64,
        softNum: 'abc123',
        iic: '8A895FD61406F2EEDE79BDC8BFF11B96',
        iicSignature:
          '455791F7752C10EC6A410DBE5BD3FC52F27AA63526A296BA142EEE1F9001CD9A2BFBD49A268126ADD975A1E89F5D945DC7870CA78BB38C1CFA2E7D5BC2C95B119A74E738962308763B962A6F884107242D5A8B397D00AB158ECAB0AAAC7CC0FC3A444E5A1AFA7A6F35CF77D7019BA2A1ED7E7CAF9C2F981A0BBF659A957ECCCD5B3218097AA00FB26F515F8AC73583F0430EF30A0D0C43D4F3BFC0214F09CC899CAC034DA07A393EBD12E0168BE5F336B2DE806F22F94122EE36FD406EBA85563BFF1727DAC9CFBD5EB10BDB5793233C278057DE0BA9A13288888C3D0E6D7258643BBDF4689E5B161CEA6D4255E5F7F7C7465E0BB2B42B6F818DCB32F1AE5A1F',
        sameTaxItems: [
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
            typeOfInv: 'N',
            cashRegister: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.header).toBeDefined();
      expect(res.body.body.invNum).toBe('6/2020');
    });

    it(`should respond with 200 when creating a selfIssuing
      invoice with valid data`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            selfIssuing: true,
            typeOfSelfIss: 'P',
            buyer: {
              ...payload.issuer,
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
            paymentMeth: undefined,
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
            businUnit: undefined,
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
            issuer: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is true
      and typeOfSelfIss is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            selfIssuing: true,
            typeOfSelfIss: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is true
      and typeOfSelfIss is not a valid type`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            selfIssuing: true,
            typeOfSelfIss: 'Q',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is false
      and typeOfSelfIss is provided`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            selfIssuing: true,
            typeOfSelfIss: 'S',
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
            typeOfInv: 'C',
            cashRegister: undefined,
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if paymentMeth is not a valid
      payment method`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            paymentMeth: 'F',
          },
          certificates: {
            privateKey,
            certificate,
          },
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is true and
      buyer info is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            selfIssuing: true,
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

    // consumptionTaxItems
    it(`should respond with 400 if consumptionTaxItems
      is defined but required fields are missing`, async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            consumptionTaxItems: [
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
            consumptionTaxItems: [
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
            consumptionTaxItems: [
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

    it(`should respond with 200 with valid consumptionTaxItems`, async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          payload: {
            ...payload,
            consumptionTaxItems: [
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
      expect(res.body.body.consumptionTaxItems).toMatchObject([
        {
          consTaxRate: 20,
          numOfItems: 1,
          priceBefConsTax: 14,
          consTaxAmount: 2.8,
        },
      ]);
    });
  });
});
