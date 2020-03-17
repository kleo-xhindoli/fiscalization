import {
  RegisterTCRRequest,
  RegisterTCRResponse,
  TCRCashBalanceRequest,
  TCRCashBalanceResponse,
} from '../types';
import {
  generateFiscHeaders,
  generateSubsequentFiscHeaders,
} from '../utils/fiscHeaders';
import uuidv4 from 'uuid/v4';
import config from '../config';

export async function registerTCR(
  tcrRequest: RegisterTCRRequest
): Promise<RegisterTCRResponse> {
  const { UUID: requestUUID, sendDateTime } = generateFiscHeaders();

  // TODO: Implementation
  const tcrCode = 'tcr1234';
  return {
    header: {
      requestUUID,
      sendDateTime,
      UUID: uuidv4(),
    },
    body: {
      tcrCode,
      softCode: config.fiscSoftwareCode,
      maintainerCode: config.fiscMaintainerCode,
      ...tcrRequest,
    },
  };
}

export async function cashBalance(
  cashBalanceRequest: TCRCashBalanceRequest
): Promise<TCRCashBalanceResponse> {
  const { UUID: requestUUID, sendDateTime } = generateSubsequentFiscHeaders(
    cashBalanceRequest.isSubseqDeliv
  );

  const FCDC = uuidv4();

  // TODO: Implementation
  return {
    header: {
      requestUUID,
      sendDateTime,
      UUID: uuidv4(),
    },
    body: {
      ...cashBalanceRequest,
      FCDC,
    },
  };
}
