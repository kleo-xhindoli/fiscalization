import { toCentralEuropeanTimezone } from '../../../utils/date-utils';

describe('Unit | utils | date-utils', () => {
  describe('toCentralEuropeanTimezone', () => {
    it('should convert a given ISO date to the corresponding timezone in ISO', () => {
      const res = toCentralEuropeanTimezone('2019-09-26T11:50:13.000Z');
      expect(res).toBe('2019-09-26T13:50:13+02:00');
    });

    it('should convert a date object to the corresponding timezone in ISO', () => {
      const date = new Date('2019-09-26T11:50:13.000Z');
      const res = toCentralEuropeanTimezone(date);
      expect(res).toBe('2019-09-26T13:50:13+02:00');
    });

    it('should convert a date string to the corresponding timezone in ISO', () => {
      const date = new Date('2019-09-26T11:50:13.000Z').toString();
      const res = toCentralEuropeanTimezone(date);
      expect(res).toBe('2019-09-26T13:50:13+02:00');
    });
  });
});
