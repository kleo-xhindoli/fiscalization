import { formatToTimeZone } from 'date-fns-timezone';

export function toCentralEuropeanTimezone(date: Date | string): string {
  return formatToTimeZone(date, 'YYYY-MM-DDTHH:mm:ss[Z]', {
    timeZone: 'Europe/Berlin',
  });
}
