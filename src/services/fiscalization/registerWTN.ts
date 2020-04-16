import methodNamesMap from './methodNameMap';
import {
  FiscRegisterTCRRequest,
  SOAPRequestObject,
  FiscRegisterTCRResponse,
} from '../../types';
import { makeRequest } from './makeSOAPRequest';
import {
  FiscRegisterWTNRequest,
  TransferNoteItem,
  FiscRegieterWTNResponse,
} from '../../types/wtn';

function transformWTNItems(items: TransferNoteItem[]) {
  return items.map((item) => ({
    attributes: {
      C: item.code,
      N: item.name,
      Q: item.quantity,
      U: item.unit,
    },
  }));
}

function transformRegisterWTNRequest(
  request: FiscRegisterWTNRequest
): SOAPRequestObject {
  const soapRequest: SOAPRequestObject = {
    ':Header': {
      attributes: {
        SendDateTime: request.header.sendDateTime,
        UUID: request.header.UUID,
        IsSubseqDeliv: request.header.isSubseqDeliv,
      },
    },
    ':WTN': {
      attributes: {
        BusinUnit: request.body.businUnit,
        DateTimeCreated: request.body.dateTimeCreated,
        DestinAddr: request.body.destinAddr,
        DestinCity: request.body.destinCity,
        IsAfterDel: request.body.isAfterDel,
        OperatorCode: request.body.operatorCode,
        SoftNum: request.body.softNum,
        StartAddr: request.body.startAddr,
        StartCity: request.body.startCity,
        TransDate: request.body.transDate,
        VehPlates: request.body.vehPlates,
        WTNIC: request.body.wtnic,
        WTNICSignature: request.body.wtnicSignature,
        WTNNum: request.body.wtnNum,
        CarrierId: request.body.carrierId,
      },
      ':Items': {
        ':I': transformWTNItems(request.body.items),
      },
    },
  };

  return JSON.parse(JSON.stringify(soapRequest)); // removes undefined values
}

interface RegisterWTNSOAPResponse {
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
  FWTNIC: string;
  Signature: object;
}

export async function sendRegisterWTNRequest(
  request: FiscRegisterWTNRequest,
  key: string,
  cert: string
): Promise<FiscRegieterWTNResponse> {
  const { methodName, rootXmlElement } = methodNamesMap['registerWTNRequest']; // SOAP Action
  const soapReq = transformRegisterWTNRequest(request);
  const res = await makeRequest<RegisterWTNSOAPResponse>(
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
      FWTNIC: res.FWTNIC,
    },
  };
}
