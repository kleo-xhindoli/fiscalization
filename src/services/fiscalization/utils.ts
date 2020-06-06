import Big from 'big.js';

export function toDecimalOrUndefined(
  value?: number | string
): string | undefined {
  return value ? Big(value).toFixed(2) : undefined;
}
