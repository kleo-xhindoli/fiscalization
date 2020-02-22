import { formatToTimeZone } from 'date-fns-timezone';
import { getClient } from '../api/config/soap';
import {
  SOAPRequestObject,
  FiscRegisterTCRRequest,
  FiscTCRCashBalanceRequest,
} from '../types';
import { MissingSoapClientError, FiscalizationError } from '../utils/errors';
import { WSSecurityCert } from './security/CustomWSSecurityCert';
import logger from '../api/config/logger';

function getSecurity(key: string, certificate: string, methodName: string) {
  const sec = new WSSecurityCert(key, certificate, '', methodName, {
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
  key: string,
  certificate: string
) {
  const activeClient = getClient();
  if (!activeClient) throw new MissingSoapClientError();
  const reqSec = getSecurity(key, certificate, methodName);
  activeClient.setSecurity(reqSec);

  try {
    const result = await activeClient[`${methodName}Async`](request);
    // TODO: Post processing result
    return result;
  } catch (e) {
    // TODO: distinguish between Service errors and internal ones
    logger.error('[ERROR | SERVICE | FISCALIZATION]: Failed fiscalization!', e);
    throw new FiscalizationError(e, request);
  }
}

function transformRegisterTCRRequest(
  request: FiscRegisterTCRRequest
): SOAPRequestObject {
  return {
    ':Header': {
      attributes: {
        SendDateTime: request.header.sendDateTime,
        UUID: request.header.UUID,
      },
    },
    ':TCR': {
      BusinUnit: request.body.businUnit,
      IssuerNUIS: request.body.issuerNUIS,
      ManufacNum: request.body.manufacNum,
      RegDateTime: formatToTimeZone(
        request.body.regDateTime,
        'YYYY-MM-DDTHH:mm:ss[Z]',
        {
          timeZone: 'Europe/Berlin',
        }
      ),
      SoftNum: request.body.softNum,
      TCROrdNum: request.body.tcrOrdNum,
    },
  };
}

export async function sendRegisterTCRRequest(
  request: FiscRegisterTCRRequest,
  key: string,
  cert: string
) {
  const methodName = 'RegisterTCRRequest'; // SOAP Action
  const soapReq = transformRegisterTCRRequest(request);
  const res = await makeRequest(methodName, soapReq, key, cert);
  // TODO: Define return type
  return res;
}

function transformTCRCashBalanceRequest(
  request: FiscTCRCashBalanceRequest
): SOAPRequestObject {
  return {
    ':Header': {
      attributes: {
        SendDateTime: request.header.sendDateTime,
        UUID: request.header.UUID,
      },
    },
    ':TCRCashBalance': {
      attributes: {
        BalChkDatTim: request.body.balChkDatTim,
        CashAmt: request.body.cashAmt,
        IssuerNUIS: request.body.issuerNUIS,
        Operation: request.body.operation,
        TCRNumber: request.body.tcrNumber,
      },
    },
  };
}

export async function sendTCRCashBalanceRequest(
  request: FiscTCRCashBalanceRequest,
  key: string,
  cert: string
) {
  const methodName = 'RegisterTCRCashBalanceRequest';
  const soapReq = transformTCRCashBalanceRequest(request);
  const res = await makeRequest(methodName, soapReq, key, cert);
  // TODO: Define return type
  return res;
}
