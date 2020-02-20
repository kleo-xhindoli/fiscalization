import request from 'supertest';
import app, { initializeServer } from '../../setup-tests';
import { Server } from 'http';

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

    it('should register an invoice if valid data is provided', async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
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
        dateTimeCreated: '2019-09-26T11:50:13.000Z',
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
        iic: 'D04C13B4063D63A13B5D822A90178A7C',
        iicSignature:
          '404ADDB017B2DE49B0A51340A991130E670F08BC2BE854EEAAE9C3F41A2C98E1D70545690F0EFBD13511A38DB1E36E086DC253C3519E7DAF896A418BFAFCCE9836B0759B2E84713B25C39C040E35608AC85141A65D623454BAF4D0E04D69A8D77505879C1DB9552542309A110B8CB2B9885C2236C3C6D65E695DFA4CA7D6258BD9EB0749A9EE09DA237C4E1B8EE39C3CAD3E32A21F807DA0908192DADA3F9D55C4FEB3C100F97D5AA81CFE157E1A90059111E6DCD2F2AD3DB9AAA202D084144E60ADED38988C384012967EF47B548135804EF2F4542DD0971E11AA392F048836D1C7DF9014F507B79258FA9B43AA14E32196D6127FD8154C24CE0CB374677D20',
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
          ...payload,
          typeOfInv: 'N',
          cashRegister: undefined,
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
          ...payload,
          selfIssuing: true,
          typeOfSelfIss: 'P',
          buyer: {
            ...payload.issuer,
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
          ...payload,
          typeOfInv: undefined,
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          dateTimeCreated: undefined,
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          invOrdNum: undefined,
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          paymentMeth: undefined,
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          operatorCode: undefined,
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          businUnit: undefined,
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          issuer: undefined,
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is true
      and typeOfSelfIss is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          selfIssuing: true,
          typeOfSelfIss: undefined,
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is true
      and typeOfSelfIss is not a valid type`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          selfIssuing: true,
          typeOfSelfIss: 'Q',
        });

      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is false
      and typeOfSelfIss is provided`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          selfIssuing: true,
          typeOfSelfIss: 'S',
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if dateTimeCreated is not
      a valid iso string`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          dateTimeCreated: new Date().toUTCString(),
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if invOrdNum is less than 1`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          invOrdNum: 0,
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if typeOfInv is Cash and
      cashRegister is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          typeOfInv: 'C',
          cashRegister: undefined,
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if paymentMeth is not a valid
      payment method`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          paymentMeth: 'F',
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if selfIssuing is true and
      buyer info is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          selfIssuing: true,
          buyer: undefined,
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
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
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
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
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
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
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
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if rebate is defined but 
      rebateReducingBasePrice is missing`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
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
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 400 if rebate is not defined but 
      rebateReducingBasePrice is`, async () => {
      const res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
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
          ...payload,
          consumptionTaxItems: [
            {
              consTaxRate: 20.0,
              numOfItems: 1,
            },
          ],
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          consumptionTaxItems: [
            {
              consTaxRate: 20.0,
              priceBefConsTax: 14.0,
            },
          ],
        });
      expect(res.status).toBe(400);

      res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          consumptionTaxItems: [
            {
              numOfItems: 1,
              priceBefConsTax: 14.0,
            },
          ],
        });
      expect(res.status).toBe(400);
    });

    it(`should respond with 200 with valid consumptionTaxItems`, async () => {
      let res = await request(app)
        .post('/api/invoices/register')
        .set({ 'X-Api-Key': MAGNUM_API_KEY })
        .send({
          ...payload,
          consumptionTaxItems: [
            {
              consTaxRate: 20.0,
              numOfItems: 1,
              priceBefConsTax: 14.0,
            },
          ],
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
