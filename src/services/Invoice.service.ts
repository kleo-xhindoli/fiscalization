import {
  RegisterInvoiceRequest,
  RegisterInvoiceResponse,
  FiscRegisterInvoiceRequest,
  FiscInvoiceItem,
  InvoiceItem,
  RegisterRawInvoiceRequest,
} from '../types';
import {
  calculateItemPriceBeforeVAT,
  calculateItemVATAmt,
  calculatePriceAfterVAT,
  getSameTaxItemGroups,
  calculateConsTaxAmount,
  calculateTotVATValues,
  calculateUnitPriceWithVAT,
  calculateTotalFeesAmount,
} from '../utils/vat-utls';
import { generateSubsequentFiscHeaders } from '../utils/fiscHeaders';
import config from '../config';
import {
  sendRegisterInvoiceRequest,
  getRegisterInvoiceRequestXML,
} from './fiscalization';
import { FiscalizationError } from '../utils/errors';
import { generateIdentificationCode } from '../utils/crypto-utils';

export async function registerInvoice(
  invoiceRequest: RegisterInvoiceRequest,
  privateKey: string,
  certificate: string
): Promise<RegisterInvoiceResponse> {
  const fiscInvoiceRequest = getFiscInvoiceRequest(invoiceRequest, privateKey);

  try {
    const res = await sendRegisterInvoiceRequest(
      fiscInvoiceRequest,
      privateKey,
      certificate
    );

    // Ensure that softCode is not leaked in the response
    delete fiscInvoiceRequest.body.softCode;

    return {
      header: res.header,
      body: {
        ...fiscInvoiceRequest.body,
        ...res.body,
      },
    };
  } catch (e) {
    if (e instanceof FiscalizationError) {
      e.error.detail = e.error.detail || {};

      e.error.detail.request = {
        ...fiscInvoiceRequest.body,
        softCode: undefined,
      };
      throw e;
    } else {
      throw e;
    }
  }
}

export async function registerRawInvoice(
  invoiceRequest: RegisterRawInvoiceRequest,
  privateKey: string,
  certificate: string
): Promise<RegisterInvoiceResponse> {
  const requestHeader = generateSubsequentFiscHeaders(
    invoiceRequest.isSubseqDeliv
  );

  const fiscRequest: FiscRegisterInvoiceRequest = {
    header: requestHeader,
    body: {
      ...invoiceRequest,
      softCode: config.fiscSoftwareCode,
    },
  };

  const res = await sendRegisterInvoiceRequest(
    fiscRequest,
    privateKey,
    certificate
  );

  return {
    header: res.header,
    body: {
      ...invoiceRequest,
      ...res.body,
    },
  };
}

export function exportRawInvoice(
  invoiceRequest: RegisterRawInvoiceRequest,
  privateKey: string,
  certificate: string
): string {
  const requestHeader = generateSubsequentFiscHeaders(
    invoiceRequest.isSubseqDeliv
  );

  const fiscRequest: FiscRegisterInvoiceRequest = {
    header: requestHeader,
    body: {
      ...invoiceRequest,
      softCode: config.fiscSoftwareCode,
    },
  };

  const res = getRegisterInvoiceRequestXML(
    fiscRequest,
    privateKey,
    certificate
  );

  return res;
}

function getFiscInvoiceRequest(
  invoiceRequest: RegisterInvoiceRequest,
  privateKey: string
): FiscRegisterInvoiceRequest {
  const fiscInvoiceItems = getFiscInvoiceItems(invoiceRequest.items);
  const requestHeader = generateSubsequentFiscHeaders(
    invoiceRequest.isSubseqDeliv
  );
  const sameTaxes = getSameTaxItemGroups(fiscInvoiceItems);
  const consTaxes = invoiceRequest.consTaxes?.map((item) => {
    return {
      ...item,
      consTaxAmount: calculateConsTaxAmount(
        item.priceBefConsTax,
        item.consTaxRate
      ),
    };
  });

  let feesTotal = 0;
  if (invoiceRequest.fees?.length) {
    feesTotal = calculateTotalFeesAmount(invoiceRequest.fees);
  }

  const { totPrice, totVATAmt, totPriceWoVAT } = calculateTotVATValues(
    fiscInvoiceItems,
    feesTotal
  );
  const invNum = getInvNum(invoiceRequest);

  const { iic, iicSignature } = generateIIC(
    invoiceRequest.seller.idNum,
    invoiceRequest.issueDateTime,
    invNum,
    invoiceRequest.businUnitCode,
    invoiceRequest.tcrCode || '',
    config.fiscSoftwareCode,
    totPrice,
    privateKey
  );

  // TODO: fail if totPrice >  150,000 && invoice cash

  return {
    header: requestHeader,
    body: {
      ...invoiceRequest,
      invNum,
      totPriceWoVAT,
      totVATAmt,
      totPrice,
      softCode: config.fiscSoftwareCode,
      iic,
      iicSignature,
      sameTaxes,
      items: fiscInvoiceItems,
      consTaxes,
    },
  };
}

export function getInvNum(invoiceRequest: RegisterInvoiceRequest): string {
  const year = new Date().getFullYear();
  const { invOrdNum, tcrCode } = invoiceRequest;

  // if (invoiceRequest.typeOfInv === INVOICE_TYPE_CASH && tcrCode) {
  if (tcrCode) {
    return `${invOrdNum}/${year}/${tcrCode}`;
  }
  return `${invOrdNum}/${year}`;
}

function getFiscInvoiceItems(items: InvoiceItem[]): FiscInvoiceItem[] {
  return items.map((item) => {
    const unitPriceWithVAT = calculateUnitPriceWithVAT(
      item.unitPrice,
      item.VATRate
    );
    const priceBeforeVAT = calculateItemPriceBeforeVAT(
      item.quantity,
      item.unitPrice,
      item.rebate,
      item.rebateReducingBasePrice
    );
    const VATAmount = calculateItemVATAmt(item.VATRate, priceBeforeVAT);
    const priceAfterVAT = calculatePriceAfterVAT(
      priceBeforeVAT,
      VATAmount,
      item.rebate,
      item.rebateReducingBasePrice
    );

    return {
      ...item,
      unitPriceWithVAT,
      priceBeforeVAT,
      VATAmount,
      priceAfterVAT,
    };
  });
}

export function generateIIC(
  issuerNuis: string,
  issueDateTime: string,
  invoiceNumber: string,
  busiUnit: string,
  cashRegister: string,
  softNum: string,
  totalPrice: number,
  privateKey: string
) {
  const iicInput =
    `${issuerNuis}` +
    `|${issueDateTime}` +
    `|${invoiceNumber}` +
    `|${busiUnit}` +
    // TODO: Unclear if we should ignore when no cashRegister in invoice
    `|${cashRegister}` +
    `|${softNum}` +
    `|${totalPrice}`;

  const { ic, signature } = generateIdentificationCode(iicInput, privateKey);

  return {
    iic: ic,
    iicSignature: signature,
  };
}
