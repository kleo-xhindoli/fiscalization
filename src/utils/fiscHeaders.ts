import { FiscRequestHeader } from '../types';
import uuidv4 from 'uuid/v4';

export function generateFiscHeaders(): FiscRequestHeader {
  const UUID = uuidv4();
  const sendDateTime = new Date().toISOString();

  return {
    UUID,
    sendDateTime,
  };
}
