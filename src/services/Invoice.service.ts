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
} from '../utils/vat-utls';
import { generateFiscHeaders } from '../utils/fiscHeaders';
import config from '../config';
import uuidv4 from 'uuid/v4';
import NodeRSA from 'node-rsa';
import crypto from 'crypto';

export async function registerInvoice(
  invoiceRequest: RegisterInvoiceRequest,
  privateKey: string,
  certificate: string,
  iicReference?: string
): Promise<RegisterInvoiceResponse> {
  const fiscInvoiceRequest = getFiscInvoiceRequest(
    invoiceRequest,
    privateKey,
    iicReference
  );

  // TODO: Implement
  const FIC = uuidv4();
  return {
    header: {
      sendDateTime: fiscInvoiceRequest.header.sendDateTime,
      requestUUID: fiscInvoiceRequest.header.UUID,
      UUID: uuidv4(),
    },
    body: {
      ...fiscInvoiceRequest.body,
      FIC,
    },
  };
}

function getFiscInvoiceRequest(
  invoiceRequest: RegisterInvoiceRequest,
  privateKey: string,
  iicReference?: string
): FiscRegisterInvoiceRequest {
  const fiscInvoiceItems = getFiscInvoiceItems(invoiceRequest.items);
  const requestHeader = generateFiscHeaders();
  const sameTaxItems = getSameTaxItemGroups(fiscInvoiceItems);
  const consumptionTaxItems = invoiceRequest.consumptionTaxItems?.map(item => {
    return {
      ...item,
      consTaxAmount: calculateConsTaxAmount(
        item.priceBefConsTax,
        item.consTaxRate
      ),
    };
  });

  const { totPrice, totVATAmt, totPriceWoVAT } = calculateTotVATValues(
    fiscInvoiceItems
  );
  const invNum = getInvNum(invoiceRequest);

  const iicSignature = generateIICSignature(
    invoiceRequest.issuer.NUIS,
    invoiceRequest.dateTimeCreated,
    invNum,
    invoiceRequest.businUnit,
    invoiceRequest.cashRegister || '',
    config.fiscSoftwareNumber,
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
      softNum: config.fiscSoftwareNumber,
      iic,
      iicSignature,
      iicReference,
      sameTaxItems,
      items: fiscInvoiceItems,
      consumptionTaxItems,
    },
  };
}

export function getInvNum(invoiceRequest: RegisterInvoiceRequest): string {
  const year = new Date().getFullYear();
  const { invOrdNum, cashRegister } = invoiceRequest;

  if (invoiceRequest.typeOfInv === INVOICE_TYPE_CASH && cashRegister) {
    return `${invOrdNum}/${year}/${cashRegister}`;
  }
  return `${invOrdNum}/${year}`;
}

function getFiscInvoiceItems(items: InvoiceItem[]): FiscInvoiceItem[] {
  return items.map(item => {
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
  dateTimeCreated: string,
  invoiceNumber: string,
  busiUnit: string,
  cashRegister: string,
  softNum: string,
  totalPrice: number,
  privateKey: string
) {
  const iicInput =
    `${issuerNuis}` +
    `|${dateTimeCreated}` +
    `|${invoiceNumber}` +
    `|${busiUnit}` +
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
