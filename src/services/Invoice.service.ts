import {
  RegisterInvoiceRequest,
  RegisterInvoiceResponse,
  FiscRegisterInvoiceRequest,
  FiscInvoiceItem,
  InvoiceItem,
  INVOICE_TYPE_CASH,
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
import uuidv4 from 'uuid/v4';
import NodeRSA from 'node-rsa';
import crypto from 'crypto';
import { sendRegisterInvoiceRequest } from './fiscalization';

export async function registerInvoice(
  invoiceRequest: RegisterInvoiceRequest,
  privateKey: string,
  certificate: string
): Promise<RegisterInvoiceResponse> {
  const fiscInvoiceRequest = getFiscInvoiceRequest(invoiceRequest, privateKey);

  const res = await sendRegisterInvoiceRequest(
    fiscInvoiceRequest,
    privateKey,
    certificate
  );

  return {
    header: res.header,
    body: {
      ...fiscInvoiceRequest.body,
      ...res.body,
    },
  };
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
  const consTaxes = invoiceRequest.consTaxes?.map(item => {
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

  const iicSignature = generateIICSignature(
    invoiceRequest.seller.idNum,
    invoiceRequest.issueDateTime,
    invNum,
    invoiceRequest.businUnitCode,
    invoiceRequest.tcrCode || '',
    config.fiscSoftwareCode,
    totPrice,
    privateKey
  );

  const iic = generateIIC(iicSignature);

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
  return items.map(item => {
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

export function generateIIC(signature: string) {
  const hash = crypto.createHash('md5');
  hash.update(signature);
  const digest = hash.digest('hex').toUpperCase();
  return digest;
}

export function generateIICSignature(
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

  const key = new NodeRSA(privateKey, 'private');
  key.setOptions({ signingScheme: 'pkcs1-sha256' });
  const buffer = Buffer.from(iicInput, 'utf8');
  const signature = key
    .sign(buffer)
    .toString('hex')
    .toUpperCase();

  return signature;
}
