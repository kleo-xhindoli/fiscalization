export interface FiscRequestHeader {
  sendDateTime: string; // ISO String
  UUID: string; // unique request id, generated by client
}

export interface FiscResponseHeader {
  sendDateTime: string; // ISO String
  UUID: string; // unique Response id, generated by server
  requestUUID: string;
}
