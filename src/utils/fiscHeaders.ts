import { FiscRequestHeader, FiscRequestHeaderSubsequent } from '../types';
import uuidv4 from 'uuid/v4';
import { toCentralEuropeanTimezone } from './date-utils';

export function generateFiscHeaders(): FiscRequestHeader {
  const utcDate = new Date().toISOString();
  const UUID = uuidv4();
  const sendDateTime = toCentralEuropeanTimezone(utcDate);

  return {
    UUID,
    sendDateTime,
  };
}

export function generateSubsequentFiscHeaders(
  isSubsequent: boolean
): FiscRequestHeaderSubsequent {
  const headers = generateFiscHeaders();
  return {
    ...headers,
    isSubseqDeliv: isSubsequent,
  };
}
