import { getClient } from '../api/config/soap';
import { SOAPRequestObject, RegisterTCRRequest } from '../types';
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

export async function makeRequest(
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
