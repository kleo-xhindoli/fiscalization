import {
  registerInvoice,
  getInvNum,
  generateIIC,
  generateIICSignature,
} from '../../../services/Invoice.service';
import {
  INVOICE_TYPE_NON_CASH,
  INVOICE_TYPE_CASH,
  PAYMENT_METHOD_TYPE_BANKNOTE,
  RegisterInvoiceRequest,
  ID_TYPE_NUIS,
} from '../../../types';
import { exampleKey, privateKey, certificate } from '../../__test-data__/keys';

describe('Unit | Service | Invoice', () => {
  const request: RegisterInvoiceRequest = {
    isBadDebt: false,
    isSimplifiedInv: false,
    businUnitCode: 'bg517kw842',
    tcrCode: 'xb131ap287',
    dateTimeCreated: '2019-09-26T13:50:13+02:00',
    invOrdNum: 6,
    isSubseqDeliv: false,
    isIssuerInVAT: true,
    operatorCode: 'rf135zu420',
    payMethods: [
      {
        type: PAYMENT_METHOD_TYPE_BANKNOTE,
      },
    ],
    isReverseCharge: false,
    typeOfInv: INVOICE_TYPE_CASH,
    taxFreeAmt: 0,
    seller: {
      address: 'Rruga i ri 1',
      country: 'Albania',
      idType: ID_TYPE_NUIS,
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
  describe('registerInvoice', () => {
    it('should resolve with the correct RegisterInvoiceResponse', async () => {
      const response = await registerInvoice(request, privateKey, certificate);
      expect(response.header).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body).toMatchObject({
        isBadDebt: false,
        businUnitCode: 'bg517kw842',
        tcrCode: 'xb131ap287',
        dateTimeCreated: '2019-09-26T13:50:13+02:00',
        invOrdNum: 6,
        isSubseqDeliv: false,
        isIssuerInVAT: true,
        operatorCode: 'rf135zu420',
        payMethods: [
          {
            type: PAYMENT_METHOD_TYPE_BANKNOTE,
          },
        ],
        isReverseCharge: false,
        typeOfInv: INVOICE_TYPE_CASH,
        seller: {
          address: 'Rruga i ri 1',
          country: 'Albania',
          idType: ID_TYPE_NUIS,
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
            unitPrice: 199,
            unitPriceWithVAT: 230.84,
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
        softCode: 'abc123',
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

      expect(response.body.iic).toBe('8A895FD61406F2EEDE79BDC8BFF11B96');
      expect(response.body.iicSignature).toBe(
        '455791F7752C10EC6A410DBE5BD3FC52F27AA63526A296BA142EEE1F9001CD9A2BFBD49A268126ADD975A1E89F5D945DC7870CA78BB38C1CFA2E7D5BC2C95B119A74E738962308763B962A6F884107242D5A8B397D00AB158ECAB0AAAC7CC0FC3A444E5A1AFA7A6F35CF77D7019BA2A1ED7E7CAF9C2F981A0BBF659A957ECCCD5B3218097AA00FB26F515F8AC73583F0430EF30A0D0C43D4F3BFC0214F09CC899CAC034DA07A393EBD12E0168BE5F336B2DE806F22F94122EE36FD406EBA85563BFF1727DAC9CFBD5EB10BDB5793233C278057DE0BA9A13288888C3D0E6D7258643BBDF4689E5B161CEA6D4255E5F7F7C7465E0BB2B42B6F818DCB32F1AE5A1F'
      );
    });

    // TODO: test error cases
  });

  describe('getInvNum', () => {
    it('should return the formatted invNum when request type is Cash', () => {
      const invNum = getInvNum(request);
      expect(invNum).toBe('6/2020/xb131ap287');
    });

    it('should return the formatted invNum when request type is NonCash', () => {
      const invNum = getInvNum({
        ...request,
        typeOfInv: INVOICE_TYPE_NON_CASH,
      });
      expect(invNum).toBe('6/2020');
    });
  });

  describe('generateIIC', () => {
    it('should calculate the IIC for the given request', () => {
      const result = generateIIC(
        '404ADDB017B2DE49B0A51340A991130E670F08BC2BE854EEAAE9C3F41A2C98E1D70545690F0EFBD13511A38DB1E36E086DC253C3519E7DAF896A418BFAFCCE9836B0759B2E84713B25C39C040E35608AC85141A65D623454BAF4D0E04D69A8D77505879C1DB9552542309A110B8CB2B9885C2236C3C6D65E695DFA4CA7D6258BD9EB0749A9EE09DA237C4E1B8EE39C3CAD3E32A21F807DA0908192DADA3F9D55C4FEB3C100F97D5AA81CFE157E1A90059111E6DCD2F2AD3DB9AAA202D084144E60ADED38988C384012967EF47B548135804EF2F4542DD0971E11AA392F048836D1C7DF9014F507B79258FA9B43AA14E32196D6127FD8154C24CE0CB374677D20'
      );
      expect(result).toBe('E88F6627C32723F4FCB8D686EA77219A');
    });
  });

  describe('generateIICSignature', () => {
    it('should calculate the IICSignature for the given request', () => {
      const result = generateIICSignature(
        'I12345678I',
        '2019-06-12T17:05:43+02:00',
        '9952',
        'bb123bb123',
        'cc123cc123',
        'ss123ss123',
        99.01,
        exampleKey
      );
      expect(result).toBe(
        `404ADDB017B2DE49B0A51340A991130E670F08BC2BE854EEAAE9C3F41A2C98E1D70545690F0EFBD13511A38DB1E36E086DC253C3519E7DAF896A418BFAFCCE9836B0759B2E84713B25C39C040E35608AC85141A65D623454BAF4D0E04D69A8D77505879C1DB9552542309A110B8CB2B9885C2236C3C6D65E695DFA4CA7D6258BD9EB0749A9EE09DA237C4E1B8EE39C3CAD3E32A21F807DA0908192DADA3F9D55C4FEB3C100F97D5AA81CFE157E1A90059111E6DCD2F2AD3DB9AAA202D084144E60ADED38988C384012967EF47B548135804EF2F4542DD0971E11AA392F048836D1C7DF9014F507B79258FA9B43AA14E32196D6127FD8154C24CE0CB374677D20`
      );
    });
  });
});
