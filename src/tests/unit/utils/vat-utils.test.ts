import {
  calculateItemPriceBeforeVAT,
  calculateItemVATAmt,
  calculatePriceAfterVAT,
  getSameTaxItemGroups,
  calculateConsTaxAmount,
  calculateTotVATValues,
} from '../../../utils/vat-utls';

describe('Unit | utils | vat-utils', () => {
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
      expect(vatAmount).toBe(27.44491);
    });
    it('correctly calculates the VAT amount for big numbers', () => {
      const vatAmount = calculateItemVATAmt(20.0, 12453437.224534);
      expect(vatAmount).toBe(2490687.44491);
    });
  });

  describe('calculatePriceAfterVAT', () => {
    it('correctly calculates price after VAT with no rebate', () => {
      const priceAfter = calculatePriceAfterVAT(129.245, 20.68);
      expect(priceAfter).toBe(149.925);
    });

    it('correctly calculates price after VAT with no rebate for big numbers', () => {
      const priceAfter = calculatePriceAfterVAT(
        241_235_324_323.2443245,
        20.6432328
      );
      expect(priceAfter).toBe(241_235_324_343.88754);
    });

    it(`correctly calculates price after VAT with rebate and
      rebateReducingBasePrice true`, () => {
      const priceAfter = calculatePriceAfterVAT(129.245, 20.68, 20.0, true);
      expect(priceAfter).toBe(149.925);
    });

    it(`correctly calculates price after VAT with rebate and
      rebateReducingBasePrice false`, () => {
      const priceAfter = calculatePriceAfterVAT(129.245, 20.68, 20.0, false);
      expect(priceAfter).toBe(124.076);
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
          VATRate: 16,
          priceBeforeVAT: 299,
          VATAmount: 49.8,
          priceAfterVAT: 338.8,
        },
      ];
      const groups = getSameTaxItemGroups(items);
      expect(groups.length).toBe(2);
      expect(groups[0].VATRate).toBe(16);
      expect(groups[0].VATAmt).toBe(49.8 * 3);
      expect(groups[0].numOfItems).toBe(3);
      expect(groups[0].priceBeforeVAT).toBe(299 * 3);

      expect(groups[1].VATRate).toBe(20);
      expect(groups[1].VATAmt).toBe(39.8 * 2);
      expect(groups[1].numOfItems).toBe(2);
      expect(groups[1].priceBeforeVAT).toBe(199 * 2);
    });
  });

  describe('calculateConsTaxAmount', () => {
    it('correctly calculates consumer tax amount', () => {
      const taxAmt = calculateConsTaxAmount(269.356, 14.0);
      expect(taxAmt).toBe(37.70984);
    });

    it('correctly calculates consumer tax amount for big numbers', () => {
      const taxAmt = calculateConsTaxAmount(2_343_369.35436, 14.0);
      expect(taxAmt).toBe(328_071.70961);
    });
  });

  describe('calculateTotVATValues', () => {
    const items = [
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
        name: 'Fanta1',
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
    ];

    const { totPrice, totVATAmt, totPriceWoVAT } = calculateTotVATValues(items);
    expect(totPrice).toBe(238.8 * 2);
    expect(totVATAmt).toBe(39.8 * 2);
    expect(totPriceWoVAT).toBe(199 * 2);
  });
});
