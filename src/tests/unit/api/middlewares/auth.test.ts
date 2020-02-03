import auth from '../../../../api/middlewares/auth';
import * as AuthService from '../../../../services/Auth.service';


jest.mock('../../../../services/Auth.service');

const nextFn = jest.fn();
let req: any;
let res: any;

describe('Unit | Middleware | Auth', () => {
  describe('auth middleware happy path', () => {
    beforeEach(() => {
      nextFn.mockClear();
      req = {
        header: () => 'X-Api-Key someapiKey',
      };
      res = {};
    });

    it('calls next with no error if the api key is valid', () => {
      expect.assertions(2);
      //@ts-ignore
      AuthService.authorize.mockReturnValue({
        name: 'some client'
      });
      auth(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeUndefined();
    });

  });

  describe('auth middleware no api key', () => {
    beforeEach(() => {
      nextFn.mockClear();
      req = {
        header: () => undefined,
      };
      res = {};
    });

    it('calls next with an unauthorized error if no api key is provided', () => {
      expect.assertions(3);
      auth(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0].message).toBe(
        'Authorization header is missing',
      );
      expect(nextFn.mock.calls[0][0].output.statusCode).toBe(401);
    });
  });

  describe('auth middleware invalid api key', () => {
    beforeEach(() => {
      nextFn.mockClear();
      req = {
        header: () => 'X-Api-Key invalidapikey',
      };
      res = {};
    });

    it('calls next with an unauthorized error if an invalid api key is provided', () => {
      expect.assertions(3);
      // @ts-ignore
      AuthService.authorize.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      auth(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0].message).toBe('Invalid api key');
      expect(nextFn.mock.calls[0][0].output.statusCode).toBe(401);
    });
  });

});