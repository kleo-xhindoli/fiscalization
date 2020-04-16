import { FiscRequestHeaderSubsequent, FiscResponseHeader, FiscRequestHeaderSubsequent } from './fiscalization';

export interface RegisterWarehouseTransferNoteRequest {
  dateTimeCreated: string;
  wtnNum: number; // Number of the warehouse transfer note format: {Incremental Nr}{Year} example: 1232020.
  operatorCode: string;
  businUnit: string;
  startAddr: string;
  startCity: string;
  destinAddr: string;
  destinCity: string;
  isAfterDel: boolean; // if the transfer note is sent after the delivery is done
  transDate: string; // Date when the transfer is made
  carrierId?: string; // Unique ID of the carrier
  vehPlates: string;
  issuer: {
    nuis: string;
    name: string; // name of the NOTE issuer (not the name of the business)
  };
  items: TransferNoteItem[];
}

export interface FiscRegisterWTNBody
  extends RegisterWarehouseTransferNoteRequest {
  softNum: string;
  wtnic: string; // Warehouse transfer note identification code, equiv of IIC
  wtnicSignature: string;
}

export interface TransferNoteItem {
  name: string;
  code?: string;
  unit: string;
  quantity: number;
}

export interface FiscRegisterWTNRequest {
  header: FiscRequestHeaderSubsequent;
  body: FiscRegisterWTNBody;
}

export interface FiscRegieterWTNResponseBody {
  FWTNIC: string; // Fiscalization warehouse transfer note code
}

export interface FiscRegieterWTNResponse {
  header: FiscResponseHeader;
  body: FiscRegieterWTNResponseBody;
}

export interface RegisterWarehouseTransferNoteResponse {
  header: FiscResponseHeader;
  body: Omit<FiscRegisterWTNBody, 'softNum'> & FiscRegieterWTNResponseBody;
}
