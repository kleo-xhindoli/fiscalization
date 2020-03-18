export interface FiscRequestHeader {
  sendDateTime: string; // ISO String
  UUID: string; // unique request id, generated by client
}

export interface FiscRequestHeaderSubsequent extends FiscRequestHeader {
  isSubseqDeliv: boolean;
}

export interface FiscResponseHeader {
  sendDateTime: string; // ISO String
  UUID: string; // unique Response id, generated by server
  requestUUID: string;
}

export interface FiscRequest {
  header: FiscRequestHeader;
  body: { [key: string]: any };
}

export type SOAPRequestObject = {
  [key: string]: any;
};

export type SOAPResponseObject = {
  [key: string]: any;
};
