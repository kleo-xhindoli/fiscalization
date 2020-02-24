import {
  registerInvoice,
  getInvNum,
  generateIIC,
  generateIICSignature,
} from '../../../services/Invoice.service';
import { InvoiceType, PaymentMethod } from '../../../types';
import { exampleKey, privateKey, certificate } from '../../__test-data__/keys';

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
      const response = await registerInvoice(request, privateKey, certificate);
      expect(response.header).toBeDefined();
      expect(response.body).toBeDefined();
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

      expect(response.body.iic).toBe('4C27649BE4EAACA82C8EB1CDAB274AEC');
      expect(response.body.iicSignature).toBe(
        '13900A4812560C5EE549044BC13B4FC90AFB6A76B10635788E689FAF319AAFA39B6BB28ED59E7E8278646CD8EDFF43F87131F610F2DE761DBCE4030AE0EC7BB3C700620F247B7D8F890D9EA7C80726A71294AF0AD832E6ED5143D6AAE0D146E5FE547ADB257FA5643DEBF07812D612E2596DB26F22D75A8DE7387D52A2AB273BCFA72B625247FCC25F00A6DAC0E83BA4D5863032C86CDC9A752E95D220C1E8C671B601CA6BCA335EC436A6C7C7CEB15A58773F2A03E25FFC03BF310DC5C4B94495B5BCBECAC7C79092BFE21ADA7BF87432A4D645099FAD84AA18D80A53A2CB34F0B337AB600C909C0F9CF86B184A7E4BB468F0D96F6A6896C567640A90900D1B'
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
      const invNum = getInvNum({ ...request, typeOfInv: 'N' });
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
