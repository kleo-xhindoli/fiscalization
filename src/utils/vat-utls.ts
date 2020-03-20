import Big from 'big.js';
import { FiscInvoiceItem, SameTaxGroup, Fee } from '../types';

export function calculateUnitPriceWithVAT(
  unitPrice: number,
  VATRate: number
): number {
  const vatDec = Big(VATRate).div(100);
  const bUPrice = Big(unitPrice);
  return parseFloat(bUPrice.plus(vatDec.times(bUPrice)).toFixed(2));
}

export function calculateItemPriceBeforeVAT(
  quantity: number,
  unitPrice: number,
  rebate?: number,
  rebateReducingBasePrice?: boolean
): number {
  const bQty = Big(quantity);
  const bUnitPrice = Big(unitPrice);

  if (rebate && rebateReducingBasePrice) {
    const rebateDec = Big(rebate).div(100);
    const rebateAmt = bQty.times(bUnitPrice).times(rebateDec);
    return parseFloat(
      bQty
        .times(bUnitPrice)
        .minus(rebateAmt)
        .toFixed(2)
    );
  } else {
    return parseFloat(bQty.times(bUnitPrice).toFixed(2));
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
      .toFixed(2)
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
        .toFixed(2)
    );
  } else {
    return parseFloat(bPriceBefore.plus(bVATAmt).toFixed(2));
  }
}

export function getSameTaxItemGroups(items: FiscInvoiceItem[]): SameTaxGroup[] {
  // Use a hash instead of an array for quicker access
  const itemGroups: { [key: string]: SameTaxGroup } = {};

  for (const item of items) {
    if (item.exemptFromVAT) {
      // Group exemptFromVAT together by the type of exemptFromVAT
      if (!itemGroups[item.exemptFromVAT]) {
        itemGroups[item.exemptFromVAT] = {
          VATRate: item.VATRate,
          numOfItems: 1,
          priceBeforeVAT: item.priceBeforeVAT,
          VATAmt: 0,
          exemptFromVAT: item.exemptFromVAT,
        };
      } else {
        itemGroups[item.exemptFromVAT] = {
          VATRate: item.VATRate,
          numOfItems: itemGroups[item.exemptFromVAT].numOfItems + 1,
          priceBeforeVAT:
            itemGroups[item.exemptFromVAT].priceBeforeVAT + item.priceBeforeVAT,
          VATAmt: 0,
          exemptFromVAT: item.exemptFromVAT,
        };
      }
    } else {
      // Group items with the same tax rate together by the tax rate
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
  }

  return Object.values(itemGroups);
}

export function calculateConsTaxAmount(
  priceBeforeTax: number,
  taxRate: number
): number {
  const bPriceBefore = Big(priceBeforeTax);
  const bTaxRateDec = Big(taxRate).div(100);

  return parseFloat(bPriceBefore.times(bTaxRateDec).toFixed(2));
}

export function calculateTotalFeesAmount(fees: Fee[]): number {
  const bTotal = fees.reduce((tot, fee) => tot.add(fee.amt), Big(0));

  return parseFloat(bTotal.toFixed(2));
}

export function calculateTotVATValues(
  items: FiscInvoiceItem[],
  feesAmount: number = 0
) {
  let bTotPriceWoVAT = Big(0);
  let bTotVATAmt = Big(0);
  let bTotPrice = Big(0);

  // TODO: Clarify how Fees are affected by VAT

  for (let item of items) {
    bTotPriceWoVAT = bTotPriceWoVAT.add(Big(item.priceBeforeVAT));
    bTotVATAmt = bTotVATAmt.add(Big(item.VATAmount));
    bTotPrice = bTotPrice.add(Big(item.priceAfterVAT));
  }

  // Here it's assumed that fees are not subject to VAT
  return {
    totPrice: parseFloat(bTotPrice.add(feesAmount).toFixed(2)),
    totVATAmt: parseFloat(bTotVATAmt.toFixed(2)),
    totPriceWoVAT: parseFloat(bTotPriceWoVAT.add(feesAmount).toFixed(2)),
  };
}
