import {
  calculateItemPriceBeforeVAT,
  calculateItemVATAmt,
  calculatePriceAfterVAT,
  getSameTaxItemGroups,
  calculateConsTaxAmount,
  calculateTotVATValues,
  calculateUnitPriceWithVAT,
  calculateTotalFeesAmount,
} from '../../../utils/vat-utls';
import {
  EXEMPT_FROM_VAT_TYPE_1,
  EXEMPT_FROM_VAT_TYPE_2,
  ExemptFromVATType,
  Fee,
  FEE_TYPE_COMMISSION,
} from '../../../types';

describe('Unit | utils | vat-utils', () => {
  describe('calculateUnitPriceWithVAT', () => {
    it('correctly calculates unitPriceWithVAT', () => {
      const unitPriceWithVAT = calculateUnitPriceWithVAT(29.99, 20);
      expect(unitPriceWithVAT).toBe(35.99);
    });
  });

  describe('calculateItemPriceBeforeVAT', () => {
    it('correctly calculates price before VAT with no rebate', () => {
      const priceBefore = calculateItemPriceBeforeVAT(15, 30.25);
      expect(priceBefore).toBe(453.75);
    });

    it('correctly calculates price before VAT with no rebate for big numbers', () => {
      const priceBefore = calculateItemPriceBeforeVAT(15, 300_000_000.25);
      expect(priceBefore).toBe(4500000003.75);
    });

    it(`correctly calculates price before VAT with rebate and 
      rebateReducingBasePrice as false`, () => {
      const priceBefore = calculateItemPriceBeforeVAT(15, 30.25, 20.0, false);
      expect(priceBefore).toBe(453.75);
    });

    it(`correctly calculates price before VAT with rebate and 
      rebateReducingBasePrice as true`, () => {
      const priceBefore = calculateItemPriceBeforeVAT(15, 30.25, 20.0, true);
      expect(priceBefore).toBe(363);
    });
  });

  describe('calculateItemVATAmt', () => {
    it('correctly calculates the VAT amount', () => {
      const vatAmount = calculateItemVATAmt(20.0, 137.224534);
      expect(vatAmount).toBe(27.44);
    });
    it('correctly calculates the VAT amount for big numbers', () => {
      const vatAmount = calculateItemVATAmt(20.0, 12453437.224534);
      expect(vatAmount).toBe(2490687.44);
    });
  });

  describe('calculatePriceAfterVAT', () => {
    it('correctly calculates price after VAT with no rebate', () => {
      const priceAfter = calculatePriceAfterVAT(129.245, 20.68);
      expect(priceAfter).toBe(149.93);
    });

    it('correctly calculates price after VAT with no rebate for big numbers', () => {
      const priceAfter = calculatePriceAfterVAT(
        241_235_324_323.2443245,
        20.6432328
      );
      expect(priceAfter).toBe(241_235_324_343.89);
    });

    it(`correctly calculates price after VAT with rebate and
      rebateReducingBasePrice true`, () => {
      const priceAfter = calculatePriceAfterVAT(129.245, 20.68, 20.0, true);
      expect(priceAfter).toBe(149.93);
    });

    it(`correctly calculates price after VAT with rebate and
      rebateReducingBasePrice false`, () => {
      const priceAfter = calculatePriceAfterVAT(129.245, 20.68, 20.0, false);
      expect(priceAfter).toBe(124.08);
    });
  });

  describe('getSameTaxItemGroups', () => {
    it('correctly groups same VAT items when only 1 item is available', () => {
      const items = [
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
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(1);
      expect(groups[0].VATRate).toBe(20);
      expect(groups[0].VATAmt).toBe(39.8);
      expect(groups[0].numOfItems).toBe(1);
      expect(groups[0].priceBeforeVAT).toBe(199);
    });

    it(`correctly groups same VAT items when more than 1 item is available 
      within the same tax group`, () => {
      const items = [
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
          name: 'Fanta1',
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
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(1);
      expect(groups[0].VATRate).toBe(20);
      expect(groups[0].VATAmt).toBe(39.8 * 2);
      expect(groups[0].numOfItems).toBe(2);
      expect(groups[0].priceBeforeVAT).toBe(199 * 2);
    });

    it(`correctly groups exemptFromVAT tax items with different types`, () => {
      const items = [
        {
          code: '501234567890',
          name: 'Fanta',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_1 as ExemptFromVATType,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_2 as ExemptFromVATType,
        },
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(2);
      expect(groups[0].VATRate).toBe(0);
      expect(groups[0].VATAmt).toBe(0);
      expect(groups[0].numOfItems).toBe(1);
      expect(groups[0].priceBeforeVAT).toBe(199);
      expect(groups[0].exemptFromVAT).toBe('TYPE_1');

      expect(groups[1].VATRate).toBe(0);
      expect(groups[1].VATAmt).toBe(0);
      expect(groups[1].numOfItems).toBe(1);
      expect(groups[1].priceBeforeVAT).toBe(199);
      expect(groups[1].exemptFromVAT).toBe('TYPE_2');
    });

    it(`correctly groups multiple exemptFromVAT tax items with the same type`, () => {
      const items = [
        {
          code: '501234567890',
          name: 'Fanta',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_1 as ExemptFromVATType,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_1 as ExemptFromVATType,
        },
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(1);
      expect(groups[0].VATRate).toBe(0);
      expect(groups[0].VATAmt).toBe(0);
      expect(groups[0].numOfItems).toBe(2);
      expect(groups[0].priceBeforeVAT).toBe(199 * 2);
      expect(groups[0].exemptFromVAT).toBe('TYPE_1');
    });

    it(`correctly groups same VAT items when more than 1 item is available 
      within the different tax groups`, () => {
      const items = [
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
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 299,
          unitPriceWithVAT: 338.8,
          VATRate: 16,
          priceBeforeVAT: 299,
          VATAmount: 49.8,
          priceAfterVAT: 338.8,
        },
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(2);
      expect(groups[0].VATRate).toBe(16);
      expect(groups[0].VATAmt).toBe(49.8);
      expect(groups[0].numOfItems).toBe(1);
      expect(groups[0].priceBeforeVAT).toBe(299);

      expect(groups[1].VATRate).toBe(20);
      expect(groups[1].VATAmt).toBe(39.8);
      expect(groups[1].numOfItems).toBe(1);
      expect(groups[1].priceBeforeVAT).toBe(199);
    });

    it(`correctly groups same VAT items when more than 1 item is available 
      within the different tax groups, for each tax group`, () => {
      const items = [
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
          unitPriceWithVAT: 238.8,
          VATRate: 20,
          priceBeforeVAT: 199,
          VATAmount: 39.8,
          priceAfterVAT: 238.8,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 299,
          unitPriceWithVAT: 338.8,
          VATRate: 16,
          priceBeforeVAT: 299,
          VATAmount: 49.8,
          priceAfterVAT: 338.8,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 299,
          unitPriceWithVAT: 338.8,
          VATRate: 16,
          priceBeforeVAT: 299,
          VATAmount: 49.8,
          priceAfterVAT: 338.8,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 299,
          unitPriceWithVAT: 338.8,
          VATRate: 16,
          priceBeforeVAT: 299,
          VATAmount: 49.8,
          priceAfterVAT: 338.8,
        },
        // Exempt from VAT items
        {
          code: '501234567890',
          name: 'Fanta',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_1 as ExemptFromVATType,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_1 as ExemptFromVATType,
        },
        {
          code: '501234567890',
          name: 'Fanta1',
          quantity: 1,
          rebate: 0,
          rebateReducingBasePrice: true,
          unitOfMeasure: 'piece',
          unitPrice: 199,
          unitPriceWithVAT: 199,
          VATRate: 0,
          priceBeforeVAT: 199,
          VATAmount: 0,
          priceAfterVAT: 199,
          exemptFromVAT: EXEMPT_FROM_VAT_TYPE_2 as ExemptFromVATType,
        },
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(4);

      expect(groups[0].VATRate).toBe(16);
      expect(groups[0].VATAmt).toBe(49.8 * 3);
      expect(groups[0].numOfItems).toBe(3);
      expect(groups[0].priceBeforeVAT).toBe(299 * 3);

      expect(groups[1].VATRate).toBe(20);
      expect(groups[1].VATAmt).toBe(39.8 * 2);
      expect(groups[1].numOfItems).toBe(2);
      expect(groups[1].priceBeforeVAT).toBe(199 * 2);

      expect(groups[2].VATRate).toBe(0);
      expect(groups[2].VATAmt).toBe(0);
      expect(groups[2].numOfItems).toBe(2);
      expect(groups[2].exemptFromVAT).toBe(EXEMPT_FROM_VAT_TYPE_1);
      expect(groups[2].priceBeforeVAT).toBe(199 * 2);

      expect(groups[3].VATRate).toBe(0);
      expect(groups[3].VATAmt).toBe(0);
      expect(groups[3].numOfItems).toBe(1);
      expect(groups[3].exemptFromVAT).toBe(EXEMPT_FROM_VAT_TYPE_2);
      expect(groups[3].priceBeforeVAT).toBe(199);
    });
  });

  describe('calculateConsTaxAmount', () => {
    it('correctly calculates consumer tax amount', () => {
      const taxAmt = calculateConsTaxAmount(269.356, 14.0);
      expect(taxAmt).toBe(37.71);
    });

    it('correctly calculates consumer tax amount for big numbers', () => {
      const taxAmt = calculateConsTaxAmount(2_343_369.35436, 14.0);
      expect(taxAmt).toBe(328_071.71);
    });
  });

  describe('calculateTotalFeesAmount', () => {
    it('correctly calculates the total fee amount', () => {
      const fees: Fee[] = [
        {
          type: FEE_TYPE_COMMISSION,
          amt: 14.256,
        },
        {
          type: FEE_TYPE_COMMISSION,
          amt: 12.256,
        },
        {
          type: FEE_TYPE_COMMISSION,
          amt: 11,
        },
      ];

      const tot = calculateTotalFeesAmount(fees);
      expect(tot).toBe(37.51);
    });
  });

  describe('calculateTotVATValues', () => {
    it('correctly calculates total VAT values with no fees', () => {
      const items = [
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
          name: 'Fanta1',
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
      ];

      const { totPrice, totVATAmt, totPriceWoVAT } = calculateTotVATValues(
        items
      );
      expect(totPrice).toBe(238.8 * 2);
      expect(totVATAmt).toBe(39.8 * 2);
      expect(totPriceWoVAT).toBe(199 * 2);
    });

    it('correctly calculates total VAT values with fees', () => {
      const items = [
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
          name: 'Fanta1',
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
      ];

      const feesTotal = 220.24;

      const { totPrice, totVATAmt, totPriceWoVAT } = calculateTotVATValues(
        items,
        feesTotal
      );
      expect(totPrice).toBe(238.8 * 2 + feesTotal);
      expect(totVATAmt).toBe(39.8 * 2);
      expect(totPriceWoVAT).toBe(199 * 2 + feesTotal);
    });
  });
});
