import { FiscRequestHeader, FiscResponseHeader } from './fiscalization';

// ====================================================
// Constant values & helper types
// ====================================================
export const INVOICE_TYPE_CASH = 'C';
export const INVOICE_TYPE_NON_CASH = 'N';
export const INVOICE_TYPES = [INVOICE_TYPE_CASH, INVOICE_TYPE_NON_CASH];
type InvoiceType = typeof INVOICE_TYPE_CASH | typeof INVOICE_TYPE_NON_CASH;

export const SELF_ISS_TYPE_AGREEMENT = 'S'; // The previous agreement between the parties.
export const SELF_ISS_TYPE_DOMESTIC = 'P'; // Purchase from domestic farmers.
export const SELF_ISS_TYPE_ABROAD = 'U'; // Purchase of services from abroad.
export const SELF_ISS_TYPE_OTHER = 'O';
export const SELF_ISS_TYPES = [
  SELF_ISS_TYPE_AGREEMENT,
  SELF_ISS_TYPE_DOMESTIC,
  SELF_ISS_TYPE_ABROAD,
  SELF_ISS_TYPE_OTHER,
];
type SelfIssType =
  | typeof SELF_ISS_TYPE_AGREEMENT
  | typeof SELF_ISS_TYPE_DOMESTIC
  | typeof SELF_ISS_TYPE_ABROAD
  | typeof SELF_ISS_TYPE_OTHER;

export const PAYMENT_METHOD_TYPE_CASH = 'N';
export const PAYMENT_METHOD_TYPE_CARD = 'K';
export const PAYMENT_METHOD_TYPE_CHEQUE = 'C';
export const PAYMENT_METHOD_TYPE_BANK = 'T';
export const PAYMENT_METHOD_TYPE_OTHER = 'O';
export const PAYMENT_METHOD_TYPES = [
  PAYMENT_METHOD_TYPE_CASH,
  PAYMENT_METHOD_TYPE_CARD,
  PAYMENT_METHOD_TYPE_CHEQUE,
  PAYMENT_METHOD_TYPE_BANK,
  PAYMENT_METHOD_TYPE_OTHER,
];
type PaymentMethod =
  | typeof PAYMENT_METHOD_TYPE_CASH
  | typeof PAYMENT_METHOD_TYPE_CARD
  | typeof PAYMENT_METHOD_TYPE_CHEQUE
  | typeof PAYMENT_METHOD_TYPE_BANK
  | typeof PAYMENT_METHOD_TYPE_OTHER;

// ====================================================
// Request Types
// ====================================================

// What we expect from our endpoint: 
export interface RegisterInvoiceRequest {
  typeOfInv: InvoiceType;
  selfIssuing: boolean;
  typeOfSelfIss?: SelfIssType;
  dateTimeCreated: string; // ISO String
  invOrdNum: number; // ordinal number of invoice
  cashRegister?: string; // tcrNumber, required only for Cash invoice types
  issuerInVAT: boolean; // if taxpayer is in VAT (not in VAT example: foreign company)
  taxFreeAmt?: number; // total amount of the invoice that is *not* taxed
  markUpAmt?: number; // total profit of the invoice
  goodsExport?: number; // total price of exported goods (no VAT is calculated for exported goods)
  paymentMeth: PaymentMethod;
  operatorCode: string; // uniq code for the operator issueing the invoice (cashier)
  businUnit: string; // uniq code for the business unit (different from NIPT/NUIS)
  isSubseqDeliv: boolean; // true if the invoice is being delivered not in real-time (due to soft malfunction or other)
  reverseCharge: boolean; // true if the burden for VAT falls on the consumer (dont know when this is the case)
  badDebt: boolean; // true if the invoice cannot be collected

  issuer: {
    NUIS: string;
    name: string;
    address: string;
    town: string;
    country: string;
  };
  buyer?: {
    // all buyer info is required if the invoice
    // is selfIssuing, or the buyer is another
    // tax payer
    NUIS?: string;
    name?: string;
    address?: string;
    town?: string;
    country?: string;
  };

  items: InvoiceItem[];

  // group of items from the above list to which consumption tax
  // applies (alchohol, cigarettes etc).
  // not sure if it affects calculations
  consumptionTaxItems?: ConsumptionTaxGroup[];
}

// What the fiscalization service expects:
export interface FiscRegisterInvoiceRequest {
  header: FiscRequestHeader;
  body: FiscRegisterInvoiceRequestBody;
}

interface FiscRegisterInvoiceRequestBody extends RegisterInvoiceRequest {
  invNum: string; // `${invOrdNum}/${year}/${tcrNumber?}`
  totPriceWoVAT: number; // total price without any taxes
  totVATAmt: number; // total VAT in money
  totPrice: number; // total price of the invoice that the consumer will pay
  softNum: string;
  iic: string;
  iicSignature: string;
  iicReference?: string;
  sameTaxItems: SameTaxGroup[];
  items: FiscInvoiceItem[];
  consumptionTaxItems?: FiscConsumptionTaxGroup[];
}


// ====================================================
// Response Types
// ====================================================

interface FiscRegisterInvoiceResponseBody {
  FIC: string;
}

export interface FiscRegisterInvoiceResponse {
  header: FiscResponseHeader;
  body: FiscRegisterInvoiceResponseBody;
}
export interface RegisterInvoiceResponse {
  header: FiscResponseHeader;
  body: FiscRegisterInvoiceRequestBody & FiscRegisterInvoiceResponseBody;
}


// ====================================================
// Group Types
// ====================================================

export interface InvoiceItem {
  name: string; // human-friendly item name
  code?: string; // unique identifier for item (barcode)
  unitOfMeasure: string; // kg, meter, piece...
  quantity: number;
  unitPrice: number; // must *not* include VAT
  rebate?: number; // percentage of discount on the item
  rebateReducingBasePrice?: boolean; // if the rebate reduces base price
  VATRate: number; // percentage of VAT (ex. 20.00 or 16.00)
}

export interface FiscInvoiceItem extends InvoiceItem {
  /**
   * if rebateReducingBasePrice == true the following
   * is calculated as: (quantity * unitPrice) - rebate
   *
   * otherwise: quantity * unitPrice
   */
  priceBeforeVAT: number;
  VATAmount: number; // value of VAT for this item

  /**
   * if rebateReducingBasePrice == true the following
   * is calculated as: priceBeforeVAT + VATAmount
   *
   * otherwise: (priceBeforeVAT - rebate) + VATAmount
   */
  priceAfterVAT: number;
}

export interface SameTaxGroup {
  VATRate: number; // VAT Rate (in %, ex. 20.00) of all items in this group
  numOfItems: number; // number of items in this tax group
  priceBeforeVAT: number; // total price for all the items in this group *before* VAT (sum of priceBeforeVAT of each item)
  VATAmt: number; // total VAT of all items in this group
}

export interface ConsumptionTaxGroup {
  consTaxRate: number; // consumption tax rate in %
  numOfItems: number; // number of items in this group
  priceBefConsTax: number; // price before consumer tax
}

interface FiscConsumptionTaxGroup extends ConsumptionTaxGroup {
  consTaxAmount: number; // consumer tax amount
}
