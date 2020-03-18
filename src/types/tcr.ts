import {
  FiscRequestHeader,
  FiscResponseHeader,
  FiscRequestHeaderSubsequent,
} from './fiscalization';

export interface FiscRegisterTCRRequest {
  header: FiscRequestHeader;
  body: {
    businUnitCode: string; // unique business unit code
    issuerNUIS: string;
    maintainerCode: string;
    softCode: string;
    tcrIntID: number; // ordinal number for TCR starting at 1
    validFrom?: string | null;
    validTo?: string | null;
  };
}

export interface RegisterTCRRequest {
  businUnitCode: string; // unique business unit code
  issuerNUIS: string;
  tcrIntID: number; // ordinal number for TCR starting at 1
  validFrom?: string | null; // ISO
  validTo?: string | null; // ISO
}

export interface FiscRegisterTCRResponse {
  header: FiscResponseHeader;
  body: {
    tcrCode: string; // unique identifier for the registered TCR
  };
}

export interface RegisterTCRResponse {
  header: FiscResponseHeader;
  body: {
    tcrCode: string; // unique identifier for the registered TCR
    businUnitCode: string; // unique business unit code
    issuerNUIS: string;
    tcrIntID: number; // ordinal number for TCR starting at 1
    // maintainerCode: string;
    // softCode: string;
    validFrom?: string | null;
    validTo?: string | null;
  };
}

export const CASH_BALANCE_OP_INITIAL = 'INITIAL';
export const CASH_BALANCE_OP_INOUT = 'INOUT';
export const CASH_BALANCE_OP_TYPES = [
  CASH_BALANCE_OP_INITIAL,
  CASH_BALANCE_OP_INOUT,
];

export type CashBalanceOperation =
  | typeof CASH_BALANCE_OP_INITIAL
  | typeof CASH_BALANCE_OP_INOUT;

export interface FiscTCRCashBalanceRequest {
  header: FiscRequestHeaderSubsequent;
  body: {
    changeDateTime: string; // ISO
    cashAmt: number;
    issuerNUIS: string;
    operation: CashBalanceOperation; // actions: Set balance, Deposit/Withdraw respectively
    tcrCode: string;
  };
}

export interface TCRCashBalanceRequest {
  changeDateTime: string; // ISO
  cashAmt: number;
  issuerNUIS: string;
  operation: CashBalanceOperation; // actions: Set balance, Deposit/Withdraw respectively
  tcrCode: string;
  isSubseqDeliv: boolean;
}

export interface FiscTCRCashBalanceResponse {
  header: FiscResponseHeader;
  body: {
    FCDC: string; // Fiscalization cash deposit code generated by the CIS
  };
}

export interface TCRCashBalanceResponse {
  header: FiscResponseHeader;
  body: {
    changeDateTime: string; // ISO
    cashAmt: number;
    issuerNUIS: string;
    operation: CashBalanceOperation; // actions: Set balance, Deposit/Withdraw respectively
    tcrCode: string;
    FCDC: string; // Fiscalization cash deposit code generated by the CIS
    isSubseqDeliv: boolean;
  };
}
