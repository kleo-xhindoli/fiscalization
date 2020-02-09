export const INVOICE_TYPE_CASH = 'C';
export const INVOICE_TYPE_NON_CASH = 'N';
export const INVOICE_TYPES = [INVOICE_TYPE_CASH, INVOICE_TYPE_NON_CASH];

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
