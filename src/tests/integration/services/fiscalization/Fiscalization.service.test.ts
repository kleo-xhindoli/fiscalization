import { Client } from 'soap';
import { initializeSOAP, initializeMockSOAP } from '../../setup-tests';
import {
  sendRegisterTCRRequest,
  sendTCRCashBalanceRequest,
  sendRegisterInvoiceRequest,
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
import {
  CashBalanceOperation,
  FiscRegisterInvoiceRequest,
  FiscRegisterInvoiceRequestBody,
  TCRType,
} from '../../../../types';
import { subHours } from 'date-fns';

const invoiceRequestBody: FiscRegisterInvoiceRequestBody = {
  isBadDebt: false,
  businUnitCode: 'bg517kw842',
  tcrCode: 'vb721zy972',
  issueDateTime: '2020-03-19T13:23:09+01:00',
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
    country: 'ALB',
    idType: 'NUIS',
    idNum: 'L41323036D',
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
      unitPriceWithVAT: 238.8,
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
      unitPriceWithVAT: 230.84,
      priceBeforeVAT: 199,
      VATAmount: 31.84,
      priceAfterVAT: 230.84,
    },
  ],
  isSimplifiedInv: false,
  invNum: '1/2020/vb721zy972',
  totPriceWoVAT: 398,
  totVATAmt: 71.64,
  totPrice: 469.64,
  softCode: 'rm039uu671',
  iic: 'D5E6790228F28C72990FC05B5042B75F',
  iicSignature:
    '38896013F79E5704D97F11CE16A98AE8D0AA0338BE4C62C6FD17DFAF58F9D262F382F17B32A82BB7A61452F2E2CC6BB18AC26CA6AEABA6D22378588C8A019141C5EBE49237E0E28F26A00BA25690A1704AE524405384E428191A3DA55F470FD72B6B47E70EAD8BFF3EB28F3BDCF87106055CD739FBD915760C8BC7D971163316DB7F7C887001CE76FC3951E3B8A18943270947DFBDD53DA6A5272DD9EB2DCE017C418DAE356F2A8C57DE7DE2E47A379A40351C4408DCDE7FB73E81B8EB0445605A108E037F42E581D176CF2D58FC48DFF83B430CD5C64511157390FE7A1BA9C45AAB57027A4D01EE71129B281FAA1A0FAEC60E68EF27D473C9AD9F028F1AA10F',
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
};

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
          type: 'REGULAR' as TCRType,
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

  describe('sendRegisterInvoiceRequest', () => {
    it('should send the correct RegisterInvoiceRequest for a simple request', async () => {
      const header = generateSubsequentFiscHeaders(false);
      const req: FiscRegisterInvoiceRequest = {
        header,
        body: {
          ...invoiceRequestBody,
        },
      };
      const res = await sendRegisterInvoiceRequest(req, key, cert);
      expect(res.body.FIC).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
    });

    // **correctiveInvoice**
    it('should send the correct RegisterInvoiceRequest for a corrective invoice', async () => {
      const header = generateSubsequentFiscHeaders(false);
      const req: FiscRegisterInvoiceRequest = {
        header,
        body: {
          ...invoiceRequestBody,
          correctiveInvoice: {
            iicRef: 'D5E6790228F28C72990FC05B5042B75F',
            issueDateTime: '2020-03-19T13:23:09+01:00',
            type: 'CORRECTIVE',
          },
          items: [
            {
              code: '501234567890',
              name: 'Fanta',
              quantity: 9,
              rebate: 0,
              rebateReducingBasePrice: true,
              unitOfMeasure: 'piece',
              unitPrice: 199,
              VATRate: 20,
              unitPriceWithVAT: 238.8,
              priceBeforeVAT: 1791,
              VATAmount: 358.2,
              priceAfterVAT: 2149.2,
            },
          ],
        },
      };
      const res = await sendRegisterInvoiceRequest(req, key, cert);
      expect(res.body.FIC).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
    });

    // buyer info present

    it('should send the correct RegisterInvoiceRequest fif the buyer is present', async () => {
      const header = generateSubsequentFiscHeaders(false);
      const req: FiscRegisterInvoiceRequest = {
        header,
        body: {
          ...invoiceRequestBody,
          buyer: {
            address: 'Rruga i ri 1',
            country: 'ALB',
            idType: 'NUIS',
            idNum: 'L91806031N',
            name: 'Fanta LTD',
            town: 'Tirana',
          },
        },
      };
      const res = await sendRegisterInvoiceRequest(req, key, cert);
      expect(res.body.FIC).toBeDefined();
      expect(res.header.sendDateTime).toBeDefined();
      expect(res.header.UUID).toBeDefined();
      expect(res.header.requestUUID).toBe(header.UUID);
    });

    // Currency is present

    // More than one payMethod

    // SupplyDateOrPeriod present

    // consTaxes present

    // fees present
  });
});
