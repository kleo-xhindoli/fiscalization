import Big from 'big.js';
import { FiscInvoiceItem, SameTaxGroup } from '../types';

export function calculateItemPriceBeforeVAT(
  quantity: number,
  unitPrice: number,
  rebate?: number,
  rebateReducingBasePrice?: boolean
): number {
  // TODO: Consider the case when unitPrice includes VAT
  const bQty = Big(quantity);
  const bUnitPrice = Big(unitPrice);

  if (rebate && rebateReducingBasePrice) {
    const rebateDec = Big(rebate).div(100);
    const rebateAmt = bQty.times(bUnitPrice).times(rebateDec);
    return parseFloat(
      bQty
        .times(bUnitPrice)
        .minus(rebateAmt)
        .toFixed(5)
    );
  } else {
    return parseFloat(bQty.times(bUnitPrice).toFixed(5));
  }
}

export function calculateItemVATAmt(
  VATRate: number,
  priceBeforeVAT: number
): number {
  const vatDec = Big(VATRate).div(100);
  return parseFloat(
    Big(priceBeforeVAT)
      .times(vatDec)
      .toFixed(5)
  );
}

export function calculatePriceAfterVAT(
  priceBeforeVAT: number,
  VATAmount: number,
  rebate?: number,
  rebateReducingBasePrice?: boolean
): number {
  const bPriceBefore = Big(priceBeforeVAT);
  const bVATAmt = Big(VATAmount);

  if (rebate && !rebateReducingBasePrice) {
    const rebateDec = Big(rebate).div(100);
    const rebateAmt = bPriceBefore.times(rebateDec);

    return parseFloat(
      bPriceBefore
        .minus(rebateAmt)
        .plus(bVATAmt)
        .toFixed(5)
    );
  } else {
    return parseFloat(bPriceBefore.plus(bVATAmt).toFixed(5));
  }
}

export function getSameTaxItemGroups(items: FiscInvoiceItem[]): SameTaxGroup[] {
  // Use a hash instead of an array for quicker access
  const itemGroups: { [key: string]: SameTaxGroup } = {};

  for (const item of items) {
    if (!itemGroups[item.VATRate]) {
      itemGroups[item.VATRate] = {
        VATRate: item.VATRate,
        numOfItems: 1,
        priceBeforeVAT: item.priceBeforeVAT,
        VATAmt: item.VATAmount,
      };
    } else {
      itemGroups[item.VATRate] = {
        VATRate: item.VATRate,
        numOfItems: itemGroups[item.VATRate].numOfItems + 1,
        priceBeforeVAT:
          itemGroups[item.VATRate].priceBeforeVAT + item.priceBeforeVAT,
        VATAmt: itemGroups[item.VATRate].VATAmt + item.VATAmount,
      };
    }
  }

  return Object.values(itemGroups);
}

export function calculateConsTaxAmount(
  priceBeforeTax: number,
  taxRate: number
): number {
  const bPriceBefore = Big(priceBeforeTax);
  const bTaxRateDec = Big(taxRate).div(100);

  return parseFloat(bPriceBefore.times(bTaxRateDec).toFixed(5));
}

export function calculateTotVATValues(items: FiscInvoiceItem[]) {
  let bTotPriceWoVAT = Big(0);
  let bTotVATAmt = Big(0);
  let bTotPrice = Big(0);

  for (let item of items) {
    bTotPriceWoVAT = bTotPriceWoVAT.add(Big(item.priceBeforeVAT));
    bTotVATAmt = bTotVATAmt.add(Big(item.VATAmount));
    bTotPrice = bTotPrice.add(Big(item.priceAfterVAT));
  }
  return {
    totPrice: parseFloat(bTotPrice.toFixed(5)),
    totVATAmt: parseFloat(bTotVATAmt.toFixed(5)),
    totPriceWoVAT: parseFloat(bTotPriceWoVAT.toFixed(5)),
  };
}
