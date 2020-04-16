import {
  RegisterWarehouseTransferNoteRequest,
  RegisterWarehouseTransferNoteResponse,
  FiscRegisterWTNRequest,
} from '../types/wtn';
import { generateIdentificationCode } from '../utils/crypto-utils';
import config from '../config';
import uuid from 'uuid/v4';
import {
  generateSubsequentFiscHeaders,
} from '../utils/fiscHeaders';
import { sendRegisterWTNRequest } from './fiscalization';

export async function registerWarehouseTransferNote(
  request: RegisterWarehouseTransferNoteRequest,
  privateKey: string,
  certificate: string
): Promise<RegisterWarehouseTransferNoteResponse> {
  const { fiscSoftwareCode } = config;

  const { wtnic, wtnicSignature } = generateWTNIC(
    request.issuer.nuis,
    request.dateTimeCreated,
    request.wtnNum.toString(),
    request.businUnit,
    fiscSoftwareCode,
    privateKey
  );

  const fiscRequest: FiscRegisterWTNRequest = {
    header: generateSubsequentFiscHeaders(request.isAfterDel),
    body: {
      ...request,
      softNum: fiscSoftwareCode,
      wtnic,
      wtnicSignature,
    },
  };

  const response = await sendRegisterWTNRequest(
    fiscRequest,
    privateKey,
    certificate
  );

  return {
    header: response.header,
    body: {
      ...request,
      ...response.body,
      wtnic,
      wtnicSignature,
    },
  };
}

export function generateWTNIC(
  issuerNUIS: string,
  dateTimeCreated: string,
  wtnNumber: string,
  busiUnit: string,
  softNum: string,
  privateKey: string
) {
  const icInput =
    `${issuerNUIS}` +
    `|${dateTimeCreated}` +
    `|${wtnNumber}` +
    `|${busiUnit}` +
    `|${softNum}`;

  const { ic, signature } = generateIdentificationCode(icInput, privateKey);

  return {
    wtnic: ic,
    wtnicSignature: signature,
  };
}
