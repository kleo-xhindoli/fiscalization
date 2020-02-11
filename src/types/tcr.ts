import { FiscRequestHeader, FiscResponseHeader } from './fiscalization';

export interface FiscRegisterTCRRequest {
  header: FiscRequestHeader;
  body: {
    businUnit: string; // unique business unit code
    issuerNUIS: string;
    manufacNum: string;
    softNum: string;
    regDateTime: string; // ISO string
    tcrOrdNum: number; // ordinal number for TCR starting at 1
  };
}

export interface RegisterTCRRequest {
  businUnit: string; // unique business unit code
  issuerNUIS: string;
  regDateTime: string; // ISO string
  tcrOrdNum: number; // ordinal number for TCR starting at 1
}

export interface FiscRegisterTCRResponse {
  header: FiscResponseHeader;
  body: {
    tcrNumber: string; // unique identifier for the registered TCR
  };
}

export interface RegisterTCRResponse {
  header: FiscResponseHeader;
  body: {
    tcrNumber: string; // unique identifier for the registered TCR
    businUnit: string; // unique business unit code
    issuerNUIS: string;
    regDateTime: string; // ISO string
    tcrOrdNum: number; // ordinal number for TCR starting at 1
  };
}

export interface FiscTCRCashBalanceRequest {
  header: FiscRequestHeader;
  body: {
    balChkDatTim: string; // ISO
    cashAmt: number;
    issuerNUIS: string;
    operation: 'Balance' | 'Deposit' | 'Credit'; // actions: Set balance, Deposit, Withdraw respectively
    tcrNumber: string;
  };
}

export interface TCRCashBalanceRequest {
  balChkDatTim: string; // ISO
  cashAmt: number;
  issuerNUIS: string;
  operation: 'Balance' | 'Deposit' | 'Credit'; // actions: Set balance, Deposit, Withdraw respectively
  tcrNumber: string;
}

export interface FiscTCRCashBalanceResponse {
  header: FiscResponseHeader;
  body: {};
}

export interface TCRCashBalanceResponse {
  header: FiscResponseHeader;
  body: {
    balChkDatTim: string; // ISO
    cashAmt: number;
    issuerNUIS: string;
    operation: 'Balance' | 'Deposit' | 'Credit'; // actions: Set balance, Deposit, Withdraw respectively
    tcrNumber: string;
  };
}
