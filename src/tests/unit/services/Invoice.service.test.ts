import {
  registerInvoice,
  getInvNum,
  generateIIC,
} from '../../../services/Invoice.service';
import {
  INVOICE_TYPE_NON_CASH,
  INVOICE_TYPE_CASH,
  PAYMENT_METHOD_TYPE_BANKNOTE,
  RegisterInvoiceRequest,
  ID_TYPE_NUIS,
} from '../../../types';
import { exampleKey, privateKey, certificate } from '../../__test-data__/keys';
import { sendRegisterInvoiceRequest } from '../../../services/fiscalization';

describe('Unit | Service | Invoice', () => {
  const request: RegisterInvoiceRequest = {
    isBadDebt: false,
    isSimplifiedInv: false,
    businUnitCode: 'bg517kw842',
    tcrCode: 'xb131ap287',
    issueDateTime: '2019-09-26T13:50:13+02:00',
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

  beforeEach(() => {
    jest.clearAllMocks();

    // @ts-ignore
    sendRegisterInvoiceRequest = jest.fn(async (req) => {
      const FIC = '99999999-9999-9999-9999-999999999999';
      return {
        header: {
          requestUUID: req.header.UUID,
          sendDateTime: req.header.sendDateTime,
          UUID: '44444444-4444-4444-4444-444444444444',
        },
        body: {
          FIC,
        },
      };
    });
  });
  describe('registerInvoice', () => {
    it('should resolve with the correct RegisterInvoiceResponse', async () => {
      const response = await registerInvoice(request, privateKey, certificate);
      expect(response.header).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body).toMatchObject({
        isBadDebt: false,
        businUnitCode: 'bg517kw842',
        tcrCode: 'xb131ap287',
        issueDateTime: '2019-09-26T13:50:13+02:00',
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

      expect(response.body.iic).toBe('C41E9339DC78E18CFAC28B05A7613BF3');
      expect(response.body.iicSignature).toBe(
        '381D560CB6D5F8B4421380FCB39C07C13C25BED279A8E9BC212C9ED0F7FA6E9B09076DA4F980375382BBE68EE240BCC20F87DFDE6AD1DDFD9BCD5DF6E91527DC06C1A1A46CC1849EF134ADDE607A87EA55ED0957046BC6A3DA0DE49DD101166E7845B18AFAFB01872B1475E09AB2316AFF4BC74C30F3C31604133FE662596812D4F48864B6EA761733DA8389CB0F33F7C51DB8CFB9B6F9CCEE3D3426A5ECAEFC2C2852415DC5FE65979A552CFA5CEF69FE62955EC2CA57137559FEDD640876C9E0D1CF5A565EB7E4C88DA4DFFABB0388A4DCA5D8502BEE1B06B73C5B407BEC8F2CC857B07C32F45C8CF66E26DEAD317365FFF1F44BC89D26473415B0E49A94BA'
      );

      // @ts-ignore
      expect(response.body.softCode).toBeUndefined();
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
        tcrCode: undefined,
        typeOfInv: INVOICE_TYPE_NON_CASH,
      });
      expect(invNum).toBe('6/2020');
    });
  });

  describe('generateIIC', () => {
    it('should calculate the correct IIC & IICSignature for the given data', () => {
      const { iic, iicSignature } = generateIIC(
        'I12345678I',
        '2019-06-12T17:05:43+02:00',
        '9952',
        'bb123bb123',
        'cc123cc123',
        'ss123ss123',
        99.01,
        exampleKey
      );
      expect(iicSignature).toBe(
        `404ADDB017B2DE49B0A51340A991130E670F08BC2BE854EEAAE9C3F41A2C98E1D70545690F0EFBD13511A38DB1E36E086DC253C3519E7DAF896A418BFAFCCE9836B0759B2E84713B25C39C040E35608AC85141A65D623454BAF4D0E04D69A8D77505879C1DB9552542309A110B8CB2B9885C2236C3C6D65E695DFA4CA7D6258BD9EB0749A9EE09DA237C4E1B8EE39C3CAD3E32A21F807DA0908192DADA3F9D55C4FEB3C100F97D5AA81CFE157E1A90059111E6DCD2F2AD3DB9AAA202D084144E60ADED38988C384012967EF47B548135804EF2F4542DD0971E11AA392F048836D1C7DF9014F507B79258FA9B43AA14E32196D6127FD8154C24CE0CB374677D20`
      );
      expect(iic).toBe('D04C13B4063D63A13B5D822A90178A7C');
    });
  });
});
