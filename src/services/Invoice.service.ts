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

export async function registerInvoice(
  invoiceRequest: RegisterInvoiceRequest,
  iicReference?: string
): Promise<RegisterInvoiceResponse> {
  const fiscInvoiceRequest = getFiscInvoiceRequest(
    invoiceRequest,
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

  // TODO: fail if totPrice >  150,000 && invoice cash

  return {
    header: requestHeader,
    body: {
      ...invoiceRequest,
      invNum: getInvNum(invoiceRequest),
      totPriceWoVAT,
      totVATAmt,
      totPrice,
      softNum: config.fiscSoftwareNumber,
      iic: generateIIC(),
      iicSignature: generateIICSignature(),
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

export function generateIIC() {
  // TODO: Implement

  return 'D04C13B4063D63A13B5D822A90178A7C';
}

export function generateIICSignature() {
  // TODO: Implement
  return `404ADDB017B2DE49B0A51340A991130E670F08BC2BE854EEAAE9C3F41A2C98E1D70545690F0EFBD13511A38DB1E36E086DC253C3519E7DAF896A418BFAFCCE9836B0759B2E84713B25C39C040E35608AC85141A65D623454BAF4D0E04D69A8D77505879C1DB9552542309A110B8CB2B9885C2236C3C6D65E695DFA4CA7D6258BD9EB0749A9EE09DA237C4E1B8EE39C3CAD3E32A21F807DA0908192DADA3F9D55C4FEB3C100F97D5AA81CFE157E1A90059111E6DCD2F2AD3DB9AAA202D084144E60ADED38988C384012967EF47B548135804EF2F4542DD0971E11AA392F048836D1C7DF9014F507B79258FA9B43AA14E32196D6127FD8154C24CE0CB374677D20`;
}
