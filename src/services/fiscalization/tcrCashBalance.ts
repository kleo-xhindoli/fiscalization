import { request } from 'http';
import {
  FiscTCRCashBalanceRequest,
  SOAPRequestObject,
  FiscTCRCashBalanceResponse,
} from '../../types';
import { makeRequest } from './makeSOAPRequest';
import methodNamesMap from './methodNameMap';
import Big from 'big.js';

function transformTCRCashBalanceRequest(
  request: FiscTCRCashBalanceRequest
): SOAPRequestObject {
  return {
    ':Header': {
      attributes: {
        SendDateTime: request.header.sendDateTime,
        UUID: request.header.UUID,
        IsSubseqDeliv: request.header.isSubseqDeliv,
      },
    },
    ':CashDeposit': {
      attributes: {
        ChangeDateTime: request.body.changeDateTime,
        CashAmt: Big(request.body.cashAmt).toFixed(2),
        IssuerNUIS: request.body.issuerNUIS,
        Operation: request.body.operation,
        TCRCode: request.body.tcrCode,
      },
    },
  };
}

interface TCRCashBalanceSOAPResponse {
  attributes: {
    Id: 'Response';
    Version: '2';
  };
  Header: {
    attributes: {
      UUID: string;
      RequestUUID: string;
      SendDateTime: string;
    };
  };
  FCDC: string;
  Signature: object;
}

export async function sendTCRCashBalanceRequest(
  request: FiscTCRCashBalanceRequest,
  key: string,
  cert: string
): Promise<FiscTCRCashBalanceResponse> {
  const { methodName, rootXmlElement } = methodNamesMap[
    'tcrCashBalanceRequest'
  ];
  const soapReq = transformTCRCashBalanceRequest(request);
  const res = await makeRequest<TCRCashBalanceSOAPResponse>(
    methodName,
    soapReq,
    rootXmlElement,
    key,
    cert
  );

  return {
    header: {
      UUID: res.Header.attributes.UUID,
      requestUUID: res.Header.attributes.RequestUUID,
      sendDateTime: res.Header.attributes.SendDateTime,
    },
    body: {
      FCDC: res.FCDC,
    },
  };
}
