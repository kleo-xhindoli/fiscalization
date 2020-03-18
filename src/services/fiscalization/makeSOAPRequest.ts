import { getClient } from '../../api/config/soap';
import { SOAPRequestObject, SOAPResponseObject } from '../../types';
import { MissingSoapClientError } from '../../utils/errors';
import { WSSecurityCert } from './security/CustomWSSecurityCert';
import { convertAndLogError } from './errorHandler';

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

export async function makeRequest<T extends SOAPResponseObject>(
  methodName: string,
  request: SOAPRequestObject,
  rootXmlElement: string,
  key: string,
  certificate: string
): Promise<T> {
  const activeClient = getClient();
  if (!activeClient) throw new MissingSoapClientError();
  const reqSec = getSecurity(key, certificate, rootXmlElement);
  activeClient.setSecurity(reqSec);

  try {
    const result = await activeClient[`${methodName}Async`](request);
    return result[0]; // result[0] is the JSON parsed response
  } catch (e) {
    const convertedErr = convertAndLogError(e, request, activeClient);
    throw convertedErr;
  }
}
