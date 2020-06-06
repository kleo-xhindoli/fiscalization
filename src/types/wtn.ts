import {
  FiscResponseHeader,
  FiscRequestHeaderSubsequent,
} from './fiscalization';

export const WTN_TYPE_WTN = 'WTN'; // WTN without changing ownership.
export const WTN_TYPE_SALE = 'SALE'; // WTN with changing ownership.
export const WTN_TYPES = [WTN_TYPE_WTN, WTN_TYPE_SALE] as const;
export type WTNType = typeof WTN_TYPE_WTN | typeof WTN_TYPE_SALE;

export const WTN_GROUP_TYPE_FUEL = 'FUEL';
export const WTN_GROUP_TYPE_ALCOHOL = 'ALCOHOL';
export const WTN_GROUP_TYPE_CIGARETTES = 'CIGARETTES';
export const WTN_GROUP_TYPE_OTHER = 'OTHER';
export const WTN_GROUP_TYPES = [
  WTN_GROUP_TYPE_FUEL,
  WTN_GROUP_TYPE_ALCOHOL,
  WTN_GROUP_TYPE_CIGARETTES,
  WTN_GROUP_TYPE_OTHER,
] as const;
export type WTNGroupType =
  | typeof WTN_GROUP_TYPE_FUEL
  | typeof WTN_GROUP_TYPE_ALCOHOL
  | typeof WTN_GROUP_TYPE_CIGARETTES
  | typeof WTN_GROUP_TYPE_OTHER;

export const WTN_TRANSACTION_TYPE_SALES = 'SALES'; // Regular sales transaction type
export const WTN_TRANSACTION_TYPE_EXAMINATION = 'EXAMINATION'; // Examination transaction type
export const WTN_TRANSACTION_TYPE_TRANSFER = 'TRANSFER'; // Transfer transaction type
export const WTN_TRANSACTION_TYPE_DOOR = 'DOOR'; // Door to door sales transaction type
export const WTN_TRANSACTION_TYPES = [
  WTN_TRANSACTION_TYPE_SALES,
  WTN_TRANSACTION_TYPE_EXAMINATION,
  WTN_TRANSACTION_TYPE_TRANSFER,
  WTN_TRANSACTION_TYPE_DOOR,
] as const;
export type WTNTransactionType =
  | typeof WTN_TRANSACTION_TYPE_SALES
  | typeof WTN_TRANSACTION_TYPE_EXAMINATION
  | typeof WTN_TRANSACTION_TYPE_TRANSFER
  | typeof WTN_TRANSACTION_TYPE_DOOR;

export const VEH_OWNERSHIP_OWNER = 'OWNER';
export const VEH_OWNERSHIP_THIRD_PARTY = 'THIRDPARTY';
export const VEH_OWNERSHIP_TYPES = [
  VEH_OWNERSHIP_OWNER,
  VEH_OWNERSHIP_THIRD_PARTY,
] as const;
export type VehOwnershipType =
  | typeof VEH_OWNERSHIP_OWNER
  | typeof VEH_OWNERSHIP_THIRD_PARTY;

export const WTN_LOCATION_TYPE_WAREHOUSE = 'WAREHOUSE';
export const WTN_LOCATION_TYPE_EXHIBITION = 'EXHIBITION';
export const WTN_LOCATION_TYPE_STORE = 'STORE';
export const WTN_LOCATION_TYPE_SALE = 'SALE'; // POINT OF SALE
export const WTN_LOCATION_TYPE_ANOTHER = 'ANOTHER'; // Another person's warehouse.
export const WTN_LOCATION_TYPE_CUSTOMS = 'CUSTOMS'; // Customs warehouse
export const WTN_LOCATION_TYPE_OTHER = 'OTHER';

export const WTN_LOCATION_TYPES = [
  WTN_LOCATION_TYPE_WAREHOUSE,
  WTN_LOCATION_TYPE_EXHIBITION,
  WTN_LOCATION_TYPE_STORE,
  WTN_LOCATION_TYPE_SALE,
  WTN_LOCATION_TYPE_ANOTHER,
  WTN_LOCATION_TYPE_CUSTOMS,
  WTN_LOCATION_TYPE_OTHER,
] as const;
export type WTNLocationType =
  | typeof WTN_LOCATION_TYPE_WAREHOUSE
  | typeof WTN_LOCATION_TYPE_EXHIBITION
  | typeof WTN_LOCATION_TYPE_STORE
  | typeof WTN_LOCATION_TYPE_SALE
  | typeof WTN_LOCATION_TYPE_ANOTHER
  | typeof WTN_LOCATION_TYPE_CUSTOMS
  | typeof WTN_LOCATION_TYPE_OTHER;

export const CARRIER_ID_TYPE_NUIS = 'NUIS';
export const CARRIER_ID_TYPE_PERS_ID = 'ID';

export const CARRIER_ID_TYPES = [CARRIER_ID_TYPE_NUIS, CARRIER_ID_TYPE_PERS_ID];
type CarrierIDType =
  | typeof CARRIER_ID_TYPE_NUIS
  | typeof CARRIER_ID_TYPE_PERS_ID;

export interface RegisterWarehouseTransferNoteRequest {
  wtnType: WTNType;
  groupOfGoods: WTNGroupType;
  transaction: WTNTransactionType;
  issueDateTime: string;
  operatorCode: string;
  businUnitCode: string;

  // WTN ordinal number is a sequence that is assigned to each new WTN so that
  // the WTNs can be counted. The sequence is reset at the beginning of each year.
  wtnOrdNum: number;
  wtnNum: string; // Number of the warehouse transfer note format: {Incremental Nr}/{Year} example: 123/2020.

  fuelPumNum?: string; // Number of fuel pump-manifold. Mandatory field for petrol sector.

  totPriceWoVAT?: number;
  totVATAmt?: number;
  totPrice?: number;

  vehOwnership: VehOwnershipType;
  vehPlates: string;

  startAddr: string;
  startCity: string;
  startPoint: WTNLocationType;
  startDateTime: string;
  destinAddr: string;
  destinCity: string;
  destinPoint: WTNLocationType;
  destinDateTime: string;

  isGoodsFlammable: boolean;
  isEscortRequired: boolean;

  packType?: string; // Type of packaging. example 'Euro pallet'.
  packNum?: number; // Number of packs.
  itemsNum?: number; // Number of items of goods
  isAfterDel: boolean; // if the transfer note is sent after the delivery is done

  // transDate: string; // Date when the transfer is made
  // carrierId?: string; // Unique ID of the carrier
  issuer: {
    nuis: string;
    name: string;
    address: string;
    town: string;
  };
  buyer?: {
    nuis: string;
    name: string;
    address: string;
    town: string;
  };
  carrier?: {
    // mandatory if veh type is third party
    idNum: string;
    idType: CarrierIDType;
    name: string;
    address?: string;
    town?: string;
  };

  items: TransferNoteItem[];
}

export interface FiscRegisterWTNBody
  extends RegisterWarehouseTransferNoteRequest {
  softCode: string;
  wtnic: string; // Warehouse transfer note identification code, equiv of IIC
  wtnicSignature: string;
}

export interface TransferNoteItem {
  name: string;
  code?: string;
  unit: string;
  quantity: number;
  priceBeforeVAT?: number;
  vatRate?: number;
  priceAfterVAT?: number;
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
  body: Omit<FiscRegisterWTNBody, 'softCode'> & FiscRegieterWTNResponseBody;
}
