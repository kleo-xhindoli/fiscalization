import { FiscRequestHeader } from '../types';
import uuidv4 from 'uuid/v4';
import { formatToTimeZone } from 'date-fns-timezone';

export function generateFiscHeaders(): FiscRequestHeader {
  const utcDate = new Date().toISOString();
  const UUID = uuidv4();
  const sendDateTime = formatToTimeZone(utcDate, 'YYYY-MM-DDTHH:mm:ss[Z]', {
    timeZone: 'Europe/Berlin',
  });

  return {
    UUID,
    sendDateTime,
  };
}
