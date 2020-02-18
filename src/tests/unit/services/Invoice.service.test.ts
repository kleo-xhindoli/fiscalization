import {
  registerInvoice,
  getInvNum,
  generateIIC,
  generateIICSignature,
} from '../../../services/Invoice.service';
import { InvoiceType, PaymentMethod } from '../../../types';

describe('Unit | Service | Invoice', () => {
  const request = {
    badDebt: false,
    businUnit: 'bg517kw842',
    cashRegister: 'xb131ap287',
    dateTimeCreated: '2019-09-26T13:50:13+02:00',
    invOrdNum: 6,
    isSubseqDeliv: false,
    issuerInVAT: true,
    operatorCode: 'rf135zu420',
    paymentMeth: 'N' as PaymentMethod,
    reverseCharge: false,
    selfIssuing: false,
    typeOfInv: 'C' as InvoiceType,
    taxFreeAmt: 0,
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
  describe('registerInvoice', () => {
    it('should resolve with the correct RegisterInvoiceResponse', async () => {
      const response = await registerInvoice(request);
      expect(response.header).toBeDefined();
      expect(response.body).toBeDefined();
      debugger;
      expect(response.body).toMatchObject({
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

    // TODO: test error cases
  });

  describe('getInvNum', () => {
    it('should return the formatted invNum when request type is Cash', () => {
      const invNum = getInvNum(request);
      expect(invNum).toBe('6/2020/xb131ap287');
    });

    it('should return the formatted invNum when request type is NonCash', () => {
      const invNum = getInvNum({ ...request, typeOfInv: 'N' });
      expect(invNum).toBe('6/2020');
    });
  });

  describe('generateIIC', () => {
    it('should calculate the IIC for the given request', () => {
      // TODO: proper test
      const result = generateIIC();
      expect(result).toBe('D04C13B4063D63A13B5D822A90178A7C');
    });
  });

  describe('generateIICSignature', () => {
    it('should calculate the IICSignature for the given request', () => {
      // TODO: proper test
      const result = generateIICSignature();
      expect(result).toBe(
        `404ADDB017B2DE49B0A51340A991130E670F08BC2BE854EEAAE9C3F41A2C98E1D70545690F0EFBD13511A38DB1E36E086DC253C3519E7DAF896A418BFAFCCE9836B0759B2E84713B25C39C040E35608AC85141A65D623454BAF4D0E04D69A8D77505879C1DB9552542309A110B8CB2B9885C2236C3C6D65E695DFA4CA7D6258BD9EB0749A9EE09DA237C4E1B8EE39C3CAD3E32A21F807DA0908192DADA3F9D55C4FEB3C100F97D5AA81CFE157E1A90059111E6DCD2F2AD3DB9AAA202D084144E60ADED38988C384012967EF47B548135804EF2F4542DD0971E11AA392F048836D1C7DF9014F507B79258FA9B43AA14E32196D6127FD8154C24CE0CB374677D20`
      );
    });
  });
});
