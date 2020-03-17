import { getClient } from '../api/config/soap';
import {
  SOAPRequestObject,
  FiscRegisterTCRRequest,
  FiscTCRCashBalanceRequest,
  FiscRegisterTCRResponse,
} from '../types';
import { MissingSoapClientError, FiscalizationError } from '../utils/errors';
import { WSSecurityCert } from './security/CustomWSSecurityCert';
import logger from '../api/config/logger';

const methodNamesMap = {
  registerTCRRequest: {
    methodName: 'registerTCR',
    rootXmlElement: 'RegisterTCRRequest',
  },
  tcrCashBalanceRequest: {
    methodName: 'registerCashDeposit',
    rootXmlElement: 'RegisterCashDepositRequest',
  },
};

function getSecurity(key: string, certificate: string, rootElement: string) {
  const sec = new WSSecurityCert(key, certificate, '', rootElement, {
    hasTimeStamp: false,
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    signerOptions: {
      prefix: '',
    },
  });

  return sec;
}

async function makeRequest(
  methodName: string,
  request: SOAPRequestObject,
  rootXmlElement: string,
  key: string,
  certificate: string
) {
  const activeClient = getClient();
  if (!activeClient) throw new MissingSoapClientError();
  const reqSec = getSecurity(key, certificate, rootXmlElement);
  activeClient.setSecurity(reqSec);

  try {
    const result = await activeClient[`${methodName}Async`](request);
    return result[0]; // result[0] is the JSON parsed response
  } catch (e) {
    // TODO: distinguish between Service errors and internal ones
    logger.error('[ERROR | SERVICE | FISCALIZATION]: Failed fiscalization!', e);
    throw new FiscalizationError(e, request);
  }
}

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
    soapRequest[':TCR'].attributes.ValidFrom = request.body.validFrom;
  }
  if (request.body.validTo) {
    soapRequest[':TCR'].attributes.ValidTo = request.body.validTo;
  }

  return soapRequest;
}

export async function sendRegisterTCRRequest(
  request: FiscRegisterTCRRequest,
  key: string,
  cert: string
): Promise<FiscRegisterTCRResponse> {
  const { methodName, rootXmlElement } = methodNamesMap['registerTCRRequest']; // SOAP Action
  const soapReq = transformRegisterTCRRequest(request);
  const res = await makeRequest(methodName, soapReq, rootXmlElement, key, cert);

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
        CashAmt: request.body.cashAmt,
        IssuerNUIS: request.body.issuerNUIS,
        Operation: request.body.operation,
        TCRCode: request.body.tcrCode,
      },
    },
  };
}

export async function sendTCRCashBalanceRequest(
  request: FiscTCRCashBalanceRequest,
  key: string,
  cert: string
) {
  const { methodName, rootXmlElement } = methodNamesMap[
    'tcrCashBalanceRequest'
  ];
  const soapReq = transformTCRCashBalanceRequest(request);
  const res = await makeRequest(methodName, soapReq, rootXmlElement, key, cert);
  // TODO: Define return type
  return res;
}
