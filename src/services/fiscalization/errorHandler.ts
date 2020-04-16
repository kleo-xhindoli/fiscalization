import { SOAPRequestObject } from '../../types';
import logger from '../../api/config/logger';
import {
  ClientFiscalizationError,
  ServerFiscalizationError,
  FiscalizationError,
} from '../../utils/errors';
import { Client } from 'soap';

interface FiscalizationFault {
  faultcode: string;
  faultstring: string;
  detail: {
    code: string;
    requestUUID: string;
    responseUUID: string;
  };
}

export function convertAndLogError(
  e: any,
  request: SOAPRequestObject,
  client: Client
) {
  if (
    e.cause &&
    e.cause.root &&
    e.cause.root.Envelope.Body &&
    e.cause.root.Envelope.Body.Fault
  ) {
    const fault = e.cause.root.Envelope.Body.Fault as FiscalizationFault;
    if (fault.faultcode.toLocaleLowerCase().includes('client')) {
      const error = {
        ...fault,
        request,
        rawRequest: client.lastRequest,
        // rawResponse: client.lastResponse,
      };

      logger.error(
        '[ERROR | SERVICE | FISCALIZATION]: Client Fiscalization Error',
        error
      );

      return new ClientFiscalizationError(error);
    } else if (fault.faultcode.toLowerCase().includes('server')) {
      const error = {
        ...fault,
        request,
        rawRequest: client.lastRequest,
        // rawResponse: client.lastResponse,
      };
      logger.error(
        '[ERROR | SERVICE | FISCALIZATION]: Server Fiscalization Error',
        error
      );

      return new ServerFiscalizationError(error);
    }
  } else {
    logger.error(
      '[ERROR | SERVICE | FISCALIZATION]: Unknown Fiscalization Error',
      {
        error: e,
        request,
        rawRequest: client.lastRequest,
        rawResponse: client.lastResponse,
      }
    );
    return new FiscalizationError(e);
  }
}
