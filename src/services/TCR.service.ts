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
import {
  sendRegisterTCRRequest,
  sendTCRCashBalanceRequest,
} from './fiscalization';

export async function registerTCR(
  tcrRequest: RegisterTCRRequest,
  privateKey: string,
  certificate: string
): Promise<RegisterTCRResponse> {
  const header = generateFiscHeaders();

  const { header: resHeader, body: resBody } = await sendRegisterTCRRequest(
    {
      header,
      body: {
        ...tcrRequest,
        maintainerCode: config.fiscMaintainerCode,
        softCode: config.fiscSoftwareCode,
      },
    },
    privateKey,
    certificate
  );

  return {
    header: resHeader,
    body: {
      ...resBody,
      ...tcrRequest,
    },
  };
}

export async function cashBalance(
  cashBalanceRequest: TCRCashBalanceRequest,
  privateKey: string,
  certificate: string
): Promise<TCRCashBalanceResponse> {
  const header = generateSubsequentFiscHeaders(
    cashBalanceRequest.isSubseqDeliv
  );

  const { header: resHeader, body: resBody } = await sendTCRCashBalanceRequest(
    {
      header,
      body: {
        ...cashBalanceRequest,
      },
    },
    privateKey,
    certificate
  );

  return {
    header: resHeader,
    body: {
      ...resBody,
      ...cashBalanceRequest,
    },
  };
}
