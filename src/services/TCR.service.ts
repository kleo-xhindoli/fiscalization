import {
  RegisterTCRRequest,
  RegisterTCRResponse,
  TCRCashBalanceRequest,
  TCRCashBalanceResponse,
} from '../types';
import { generateFiscHeaders } from '../utils/fiscHeaders';
import uuidv4 from 'uuid/v4';

export async function registerTCR(
  tcrRequest: RegisterTCRRequest
): Promise<RegisterTCRResponse> {
  const { UUID: requestUUID, sendDateTime } = generateFiscHeaders();
  const tcrNumber = 'tcr1234';

  // TODO: Implementation
  return {
    header: {
      requestUUID,
      sendDateTime,
      UUID: uuidv4(),
    },
    body: {
      tcrNumber,
      ...tcrRequest,
    },
  };
}

export async function cashBalance(
  cashBalanceRequest: TCRCashBalanceRequest
): Promise<TCRCashBalanceResponse> {
  const { UUID: requestUUID, sendDateTime } = generateFiscHeaders();

  // TODO: Implementation
  return {
    header: {
      requestUUID,
      sendDateTime,
      UUID: uuidv4(),
    },
    body: {
      ...cashBalanceRequest,
    },
  };
}
