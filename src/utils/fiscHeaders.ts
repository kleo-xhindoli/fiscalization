import { FiscRequestHeader } from '../types';
import uuidv4 from 'uuid/v4';
import { formatToTimeZone } from 'date-fns-timezone';
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
