import methodNamesMap from './methodNameMap';
import {
  SOAPRequestObject,
  FiscRegisterInvoiceRequest,
  FiscRegisterInvoiceResponse,
  PaymentMethod,
  FiscInvoiceItem,
  SameTaxGroup,
  FiscConsumptionTaxGroup,
  Fee,
} from '../../types';
import { makeRequest, getGeneratedRequestXML } from './makeSOAPRequest';
import { toDecimalOrUndefined } from './utils';

function transformPayMethods(payMethods: PaymentMethod[]) {
  return payMethods.map(({ amt, type }) => ({
    attributes: {
      Amt: toDecimalOrUndefined(amt),
      Type: type,
    },
  }));
}

function transformItems(items: FiscInvoiceItem[]) {
  return items.map((item) => ({
    attributes: {
      N: item.name,
      C: item.code,
      U: item.unitOfMeasure,
      Q: item.quantity,
      UPB: toDecimalOrUndefined(item.unitPrice),
      UPA: toDecimalOrUndefined(item.unitPriceWithVAT),
      R: item.rebate,
      RR: item.rebateReducingBasePrice,
      VR: toDecimalOrUndefined(item.VATRate),
      VA: toDecimalOrUndefined(item.VATAmount),
      EX: item.exemptFromVAT,
      PB: toDecimalOrUndefined(item.priceBeforeVAT),
      PA: toDecimalOrUndefined(item.priceAfterVAT),
    },
  }));
}

function transformSameTaxes(sameTaxes: SameTaxGroup[]) {
  return sameTaxes.map((taxGroup) => ({
    attributes: {
      NumOfItems: taxGroup.numOfItems,
      PriceBefVAT: toDecimalOrUndefined(taxGroup.priceBeforeVAT),
      VATRate: toDecimalOrUndefined(taxGroup.VATRate),
      ExemptFromVAT: taxGroup.exemptFromVAT,
      VATAmt: toDecimalOrUndefined(taxGroup.VATAmt),
    },
  }));
}

function transfromConsTaxes(consTaxes: FiscConsumptionTaxGroup[]) {
  return consTaxes.map((taxGroup) => ({
    attributes: {
      NumOfItems: taxGroup.numOfItems,
      PriceBefConsTax: toDecimalOrUndefined(taxGroup.priceBefConsTax),
      ConsTaxRate: toDecimalOrUndefined(taxGroup.consTaxRate),
      ConsTaxAmt: toDecimalOrUndefined(taxGroup.consTaxAmount),
    },
  }));
}

function transformFees(fees: Fee[]) {
  return fees.map((fee) => ({
    attributes: {
      Type: fee.type,
      Amt: toDecimalOrUndefined(fee.amt),
    },
  }));
}

function transformRegisterInvoiceRequest(
  request: FiscRegisterInvoiceRequest
): SOAPRequestObject {
  const { body, header } = request;
  const invoiceObject: Partial<SOAPRequestObject> = {
    attributes: {
      TypeOfInv: body.typeOfInv,
      TypeOfSelfIss: body.typeOfSelfIss,
      IsSimplifiedInv: body.isSimplifiedInv,
      IssueDateTime: body.issueDateTime,
      InvNum: body.invNum,
      InvOrdNum: body.invOrdNum,
      TCRCode: body.tcrCode,
      IsIssuerInVAT: body.isIssuerInVAT,
      TaxFreeAmt: toDecimalOrUndefined(body.taxFreeAmt),
      MarkUpAmt: toDecimalOrUndefined(body.markUpAmt),
      GoodsExAmt: toDecimalOrUndefined(body.goodsExAmt),
      TotPriceWoVAT: toDecimalOrUndefined(body.totPriceWoVAT),
      TotVATAmt: toDecimalOrUndefined(body.totVATAmt),
      TotPrice: toDecimalOrUndefined(body.totPrice),
      OperatorCode: body.operatorCode,
      BusinUnitCode: body.businUnitCode,
      SoftCode: body.softCode,
      IIC: body.iic,
      IICSignature: body.iicSignature,
      IsReverseCharge: body.isReverseCharge,
      IsBadDebt: body.isBadDebt,
      PayDeadline: body.payDeadline,
    },
    ':Seller': {
      attributes: {
        IDType: body.seller.idType,
        IDNum: body.seller.idNum,
        Name: body.seller.name,
        Address: body.seller.address,
        Town: body.seller.town,
        Country: body.seller.country,
      },
    },
    ':PayMethods': {
      ':PayMethod': transformPayMethods(body.payMethods),
    },
    ':Items': {
      ':I': transformItems(body.items),
    },
    ':SameTaxes': {
      ':SameTax': transformSameTaxes(body.sameTaxes),
    },
  };

  // Include optional fields if present
  if (body.buyer) {
    invoiceObject[':Buyer'] = {
      attributes: {
        IDType: body.buyer.idType,
        IDNum: body.buyer.idNum,
        Name: body.buyer.name,
        Address: body.buyer.address,
        Town: body.buyer.town,
        Country: body.buyer.country,
      },
    };
  }

  if (body.correctiveInvoice) {
    invoiceObject[':CorrectiveInv'] = {
      attributes: {
        IICRef: body.correctiveInvoice.iicRef,
        IssueDateTime: body.correctiveInvoice.issueDateTime,
        Type: body.correctiveInvoice.type,
      },
    };
  }

  if (body.supplyDateOrPeriod) {
    invoiceObject[':SupplyDateOrPeriod'] = {
      attributes: {
        Start: body.supplyDateOrPeriod.start,
        End: body.supplyDateOrPeriod.end,
      },
    };
  }

  if (body.currency) {
    invoiceObject[':Currency'] = {
      attributes: {
        Code: body.currency.code,
        ExRate: body.currency.exRate,
      },
    };
  }

  if (body.consTaxes?.length) {
    invoiceObject[':ConsTaxes'] = {
      ':ConsTax': transfromConsTaxes(body.consTaxes),
    };
  }

  if (body.fees?.length) {
    invoiceObject[':Fees'] = {
      ':Fee': transformFees(body.fees),
    };
  }

  const soapRequest: SOAPRequestObject = {
    ':Header': {
      attributes: {
        SendDateTime: header.sendDateTime,
        UUID: header.UUID,
        IsSubseqDeliv: header.isSubseqDeliv,
      },
    },
    ':Invoice': invoiceObject,
  };

  return JSON.parse(JSON.stringify(soapRequest)); // removes undefined values
}

interface RegisterInvoiceSOAPResponse {
  attributes: {
    Id: 'Response';
    Version: '2';
  };
  Header: {
    attributes: {
      UUID: string;
      RequestUUID: string;
      SendDateTime: string;
    };
  };
  FIC: string;
  Signature: object;
}

export async function sendRegisterInvoiceRequest(
  request: FiscRegisterInvoiceRequest,
  key: string,
  cert: string
): Promise<FiscRegisterInvoiceResponse> {
  const { methodName, rootXmlElement } = methodNamesMap[
    'registerInvoiceRequest'
  ]; // SOAP Action
  const soapReq = transformRegisterInvoiceRequest(request);
  const res = await makeRequest<RegisterInvoiceSOAPResponse>(
    methodName,
    soapReq,
    rootXmlElement,
    key,
    cert
  );

  return {
    header: {
      UUID: res.Header.attributes.UUID,
      requestUUID: res.Header.attributes.RequestUUID,
      sendDateTime: res.Header.attributes.SendDateTime,
    },
    body: {
      FIC: res.FIC,
    },
  };
}

export function getRegisterInvoiceRequestXML(
  request: FiscRegisterInvoiceRequest,
  key: string,
  cert: string
) {
  const { rootXmlElement } = methodNamesMap['registerInvoiceRequest']; // SOAP Action
  const soapReq = transformRegisterInvoiceRequest(request);
  const res = getGeneratedRequestXML(soapReq, rootXmlElement, key, cert);

  return res;
}
