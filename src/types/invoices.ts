import {
  FiscResponseHeader,
  FiscRequestHeaderSubsequent,
} from './fiscalization';
import { CurrencyCode } from './currency-codes';
import { CountryCode } from './country-codes';

// ====================================================
// Constant values & helper types
// ====================================================
export const INVOICE_TYPE_CASH = 'CASH';
export const INVOICE_TYPE_NON_CASH = 'NONCASH';
export const INVOICE_TYPES = [INVOICE_TYPE_CASH, INVOICE_TYPE_NON_CASH];
export type InvoiceType =
  | typeof INVOICE_TYPE_CASH
  | typeof INVOICE_TYPE_NON_CASH;

export const SELF_ISS_TYPE_AGREEMENT = 'AGREEMENT'; // The previous agreement between the parties.
export const SELF_ISS_TYPE_DOMESTIC = 'DOMESTIC'; // Purchase from domestic farmers.
export const SELF_ISS_TYPE_ABROAD = 'ABROAD'; // Purchase of services from abroad.
export const SELF_ISS_TYPE_OTHER = 'OTHER';
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

export const ID_TYPE_NUIS = 'NUIS';
export const ID_TYPE_PERS_ID = 'ID';
export const ID_TYPE_PASSPORT = 'PASS';
export const ID_TYPE_VAT_NO = 'VAT';
export const ID_TYPE_TAX_NO = 'TAX';
export const ID_TYPE_TAX_SSN = 'SOC'; // Social security number
export const ID_TYPES = [
  ID_TYPE_NUIS,
  ID_TYPE_PERS_ID,
  ID_TYPE_PASSPORT,
  ID_TYPE_VAT_NO,
  ID_TYPE_TAX_NO,
  ID_TYPE_TAX_SSN,
];
type IDType =
  | typeof ID_TYPE_NUIS
  | typeof ID_TYPE_PERS_ID
  | typeof ID_TYPE_PASSPORT
  | typeof ID_TYPE_VAT_NO
  | typeof ID_TYPE_TAX_NO
  | typeof ID_TYPE_TAX_SSN;

export const CORRECTIVE_INVOICE_TYPE_CORRECTIVE = 'CORRECTIVE';
export const CORRECTIVE_INVOICE_TYPE_DEBIT = 'DEBIT';
export const CORRECTIVE_INVOICE_TYPE_CREDIT = 'CREDIT';
export const CORRECTIVE_INVOICE_TYPES = [
  CORRECTIVE_INVOICE_TYPE_CORRECTIVE,
  CORRECTIVE_INVOICE_TYPE_DEBIT,
  CORRECTIVE_INVOICE_TYPE_CREDIT,
];
type CorrectiveInvoiceType =
  | typeof CORRECTIVE_INVOICE_TYPE_CORRECTIVE
  | typeof CORRECTIVE_INVOICE_TYPE_DEBIT
  | typeof CORRECTIVE_INVOICE_TYPE_CREDIT;

// ====================================================
// Request Types
// ====================================================

// What we expect from our endpoint:
export interface RegisterInvoiceRequest {
  typeOfInv: InvoiceType;
  isSimplifiedInv: boolean; // Is invoice simplified
  // selfIssuing: boolean;
  typeOfSelfIss?: SelfIssType;
  issueDateTime: string; // ISO String
  invOrdNum: number; // ordinal number of invoice
  tcrCode?: string; // tcrCode, required only for Cash invoice types
  isIssuerInVAT: boolean; // if taxpayer is in VAT (not in VAT example: foreign company)

  // TODO: possibly derive this value:
  taxFreeAmt?: number; // total amount of the invoice that is *not* taxed

  // The total amount pertaining to the special margin scheme procedure in the invoice in decimal form (the taxable
  // amount). The margin for used goods, works of art, collectibles or antiques.
  markUpAmt?: number;
  goodsExAmt?: number; // total price of exported goods (no VAT is calculated for exported goods)
  operatorCode: string; // uniq code for the operator issueing the invoice (cashier)
  businUnitCode: string; // uniq code for the business unit (different from NIPT/NUIS)
  isSubseqDeliv: boolean; // true if the invoice is being delivered not in real-time (due to soft malfunction or other)
  isReverseCharge: boolean; // true if the burden for VAT falls on the consumer (dont know when this is the case)
  isBadDebt: boolean; // true if the invoice cannot be collected
  payDeadline?: string; // ISO date

  // required if the invoice is not issued in ALL
  currency?: {
    code: CurrencyCode;
    exRate: number;
  };

  // Represents the date or period of when the goods are supplied to the buyer
  // if they're not supplied at the date when the invoice is issued
  supplyDateOrPeriod?: {
    start: string; // ISO string
    end: string; // ISO string, should be same as start if this is not a period
  };

  // Required if the invoice is corrective
  correctiveInvoice?: {
    iicRef: string;
    issueDateTime: string; // ISO
    type: CorrectiveInvoiceType;
  };

  seller: {
    idType: IDType;
    idNum: string; // NUIS, personal ID, SSN...
    name: string;
    address?: string;
    town?: string;
    country?: CountryCode;
  };
  buyer?: {
    // all buyer info is required if the invoice
    // is selfIssuing, or the buyer is another
    // tax payer, or goodsExAmt exists
    idType?: IDType;
    idNum?: string; // NUIS, personal ID, SSN...
    name?: string;
    address?: string;
    town?: string;
    country?: CountryCode;
  };

  payMethods: PaymentMethod[];

  items: InvoiceItem[];

  // group of items from the above list to which consumption tax
  // applies (alchohol, cigarettes etc).
  // not sure if it affects calculations
  consTaxes?: ConsumptionTaxGroup[];

  fees?: Fee[];

  // required if the invoice is a summary invoice
  sumIICRefs?: SummaryIICReference[];
}

// What the fiscalization service expects:
export interface FiscRegisterInvoiceRequest {
  header: FiscRequestHeaderSubsequent;
  body: FiscRegisterInvoiceRequestBody;
}

export interface FiscRegisterInvoiceRequestBody extends RegisterInvoiceRequest {
  invNum: string; // `${invOrdNum}/${year}/${tcrNumber?}`
  totPriceWoVAT: number; // total price without any taxes
  totVATAmt: number; // total VAT in money
  totPrice: number; // total price of the invoice that the consumer will pay
  softCode: string;
  iic: string;
  iicSignature: string;
  sameTaxes: SameTaxGroup[];
  items: FiscInvoiceItem[];
  consTaxes?: FiscConsumptionTaxGroup[];
}

export type RegisterRawInvoiceRequest = Omit<
  FiscRegisterInvoiceRequestBody,
  'softCode'
>;

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
  body: Omit<FiscRegisterInvoiceRequestBody, 'softCode'> &
    FiscRegisterInvoiceResponseBody;
}

// ====================================================
// Group Types
// ====================================================

export const EXEMPT_FROM_VAT_TYPE_1 = 'TYPE_1'; // Exempted on the basis of Article 51 of the VAT law
export const EXEMPT_FROM_VAT_TYPE_2 = 'TYPE_2'; // Exempted on the basis of Articles 53 and 54 of the VAT law
export const EXEMPT_FROM_VAT_TYPES = [
  EXEMPT_FROM_VAT_TYPE_1,
  EXEMPT_FROM_VAT_TYPE_2,
];

export type ExemptFromVATType =
  | typeof EXEMPT_FROM_VAT_TYPE_1
  | typeof EXEMPT_FROM_VAT_TYPE_2;
export interface InvoiceItem {
  name: string; // human-friendly item name
  code?: string; // unique identifier for item (barcode)
  unitOfMeasure: string; // kg, meter, piece...
  quantity: number;
  unitPrice: number; // must *not* include VAT
  rebate?: number; // percentage of discount on the item
  rebateReducingBasePrice?: boolean; // if the rebate reduces base price
  exemptFromVAT?: ExemptFromVATType;
  VATRate: number; // percentage of VAT (ex. 20.00 or 16.00)
}

export interface FiscInvoiceItem extends InvoiceItem {
  unitPriceWithVAT: number;
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
  exemptFromVAT?: ExemptFromVATType;
}

export interface ConsumptionTaxGroup {
  consTaxRate: number; // consumption tax rate in %
  numOfItems: number; // number of items in this group
  priceBefConsTax: number; // price before consumer tax
}

export interface FiscConsumptionTaxGroup extends ConsumptionTaxGroup {
  consTaxAmount: number; // consumer tax amount
}

export const FEE_TYPE_PACK = 'PACK'; // Packaging fee
export const FEE_TYPE_BOTTLE = 'BOTTLE'; // Fee for the return of glass bottles
export const FEE_TYPE_COMMISSION = 'COMMISSION'; // Commission for currency exchange activities
export const FEE_TYPE_OTHER = 'OTHER';
export const FEE_TYPES = [
  FEE_TYPE_PACK,
  FEE_TYPE_BOTTLE,
  FEE_TYPE_COMMISSION,
  FEE_TYPE_OTHER,
];

export type FeeType =
  | typeof FEE_TYPE_PACK
  | typeof FEE_TYPE_BOTTLE
  | typeof FEE_TYPE_COMMISSION
  | typeof FEE_TYPE_OTHER;

export interface Fee {
  type: FeeType;
  amt: number;
}

export const PAYMENT_METHOD_TYPE_BANKNOTE = 'BANKNOTE';
export const PAYMENT_METHOD_TYPE_CARD = 'CARD';
export const PAYMENT_METHOD_TYPE_CHEQUE = 'CHECK';
export const PAYMENT_METHOD_TYPE_SVOUCHER = 'SVOUCHER'; // single-purpose voucher
export const PAYMENT_METHOD_TYPE_MVOUCHER = 'MVOUCHER'; // multi-purpose voucher
export const PAYMENT_METHOD_TYPE_COMPANY_CARD = 'COMPANY';
export const PAYMENT_METHOD_TYPE_ORDER = 'ORDER'; // Invoice not yet paid. It will be paid by summary invoice.
export const PAYMENT_METHOD_TYPE_ACCOUNT = 'ACCOUNT'; // Transaction account
export const PAYMENT_METHOD_TYPE_FACTORING = 'FACTORING';
export const PAYMENT_METHOD_TYPE_COMPESATION = 'COMPESATION';
export const PAYMENT_METHOD_TYPE_TRANSFER = 'TRANSFER'; // Transfer of rights or debts
export const PAYMENT_METHOD_TYPE_WAIVER = 'WAIVER'; // Waiver of debts
export const PAYMENT_METHOD_TYPE_KIND = 'KIND'; // Payment in kind (clearing)
export const PAYMENT_METHOD_TYPE_OTHER = 'OTHER';
export const PAYMENT_METHOD_TYPES = [
  PAYMENT_METHOD_TYPE_BANKNOTE,
  PAYMENT_METHOD_TYPE_CARD,
  PAYMENT_METHOD_TYPE_CHEQUE,
  PAYMENT_METHOD_TYPE_SVOUCHER,
  PAYMENT_METHOD_TYPE_MVOUCHER,
  PAYMENT_METHOD_TYPE_COMPANY_CARD,
  PAYMENT_METHOD_TYPE_ORDER,
  PAYMENT_METHOD_TYPE_ACCOUNT,
  PAYMENT_METHOD_TYPE_FACTORING,
  PAYMENT_METHOD_TYPE_COMPESATION,
  PAYMENT_METHOD_TYPE_TRANSFER,
  PAYMENT_METHOD_TYPE_WAIVER,
  PAYMENT_METHOD_TYPE_KIND,
  PAYMENT_METHOD_TYPE_OTHER,
];
export type PaymentMethodType =
  | typeof PAYMENT_METHOD_TYPE_BANKNOTE
  | typeof PAYMENT_METHOD_TYPE_CARD
  | typeof PAYMENT_METHOD_TYPE_CHEQUE
  | typeof PAYMENT_METHOD_TYPE_SVOUCHER
  | typeof PAYMENT_METHOD_TYPE_MVOUCHER
  | typeof PAYMENT_METHOD_TYPE_COMPANY_CARD
  | typeof PAYMENT_METHOD_TYPE_ORDER
  | typeof PAYMENT_METHOD_TYPE_ACCOUNT
  | typeof PAYMENT_METHOD_TYPE_FACTORING
  | typeof PAYMENT_METHOD_TYPE_COMPESATION
  | typeof PAYMENT_METHOD_TYPE_TRANSFER
  | typeof PAYMENT_METHOD_TYPE_WAIVER
  | typeof PAYMENT_METHOD_TYPE_KIND
  | typeof PAYMENT_METHOD_TYPE_OTHER;

export interface PaymentMethod {
  type: PaymentMethodType;
  amt?: number; // Mandatory if multiple payment methods exist
  compCard?: string; // Company card number if the payment method is company card.
  vouchers?: Voucher[];
}

export interface Voucher {
  num: string;
}

export interface SummaryIICReference {
  iic: string;
  issueDateTime: string;
}
