import methodNamesMap from './methodNameMap';
import {
  FiscRegisterTCRRequest,
  SOAPRequestObject,
  FiscRegisterTCRResponse,
} from '../../types';
import { makeRequest } from './makeSOAPRequest';

function transformRegisterTCRRequest(
  request: FiscRegisterTCRRequest
): SOAPRequestObject {
  const soapRequest: SOAPRequestObject = {
    ':Header': {
      attributes: {
        SendDateTime: request.header.sendDateTime,
        UUID: request.header.UUID,
      },
    },
    ':TCR': {
      attributes: {
        BusinUnitCode: request.body.businUnitCode,
        IssuerNUIS: request.body.issuerNUIS,
        MaintainerCode: request.body.maintainerCode,
        SoftCode: request.body.softCode,
        TCRIntID: request.body.tcrIntID,
      },
    },
  };

  if (request.body.validFrom) {
    soapRequest[':TCR'].attributes.ValidFrom = request.body.validFrom.split(
      'T'
    )[0];
  }
  if (request.body.validTo) {
    soapRequest[':TCR'].attributes.ValidTo = request.body.validTo.split('T')[0];
  }

  return soapRequest;
}

interface RegisterTCRSOAPResponse {
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
  TCRCode: string;
  Signature: object;
}

export async function sendRegisterTCRRequest(
  request: FiscRegisterTCRRequest,
  key: string,
  cert: string
): Promise<FiscRegisterTCRResponse> {
  const { methodName, rootXmlElement } = methodNamesMap['registerTCRRequest']; // SOAP Action
  const soapReq = transformRegisterTCRRequest(request);
  const res = await makeRequest<RegisterTCRSOAPResponse>(
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
      tcrCode: res.TCRCode,
    },
  };
}
