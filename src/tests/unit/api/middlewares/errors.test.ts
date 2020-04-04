import joi, { string } from '@hapi/joi';
import { notFound, converter } from '../../../../api/middlewares/error';
import Boom from '@hapi/boom';
import {
  ClientFiscalizationError,
  ServerFiscalizationError,
  FiscalizationError,
} from '../../../../utils/errors';

const nextFn = jest.fn();
const req: any = {};
const res: any = {
  status: jest.fn(),
  json: jest.fn(),
};

describe('Unit | Middleware | Error', () => {
  describe('notFound', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();
    });

    it('calls res with a 404 status', () => {
      expect.assertions(4);
      notFound(req, res);
      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(404);
      expect(res.json.mock.calls.length).toBe(1);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        status: 404,
        message: 'Not Found',
        error: 'Not Found',
      });
    });
  });

  describe('converter', () => {
    beforeEach(() => {
      nextFn.mockClear();

      res.status.mockClear();
      res.json.mockClear();
    });

    it('calls res with a 400 status on JSON parse error', () => {
      try {
        JSON.parse('{error}');
      } catch (e) {
        converter(e, req, res, nextFn);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls.length).toBe(1);
      }
    });

    it('calls res with a 400 status on a validation err', () => {
      expect.assertions(3);
      try {
        joi.attempt({ name: 'blah' }, joi.object({ title: joi.string() }));
      } catch (e) {
        converter(e, req, res, nextFn);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls.length).toBe(1);
      }
    });

    it('calls res with a 404 status on a ObjectID cast error', () => {
      expect.assertions(3);

      let error: any = Boom.badImplementation('CastError');
      error.value = 'test';
      error.name = 'CastError';

      converter(error, req, res, nextFn);

      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(404);
      expect(res.json.mock.calls.length).toBe(1);
    });

    it('calls res with a the corresponding Boom err status on a Boom error', () => {
      expect.assertions(4);

      const error = Boom.forbidden('This is forbidden');

      converter(error, req, res, nextFn);

      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(403);
      expect(res.json.mock.calls.length).toBe(1);
      expect(res.json.mock.calls[0][0].message).toBe('This is forbidden');
    });

    it('calls res with a 500 status on a random error', () => {
      expect.assertions(4);

      const error = new Error('random error');

      converter(error, req, res, nextFn);

      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(500);
      expect(res.json.mock.calls.length).toBe(1);
      expect(res.json.mock.calls[0][0].message).toBe('random error');
    });

    it('calls res with additional data on a ClientFiscalizationError', () => {
      const error = new ClientFiscalizationError({
        faultcode: 'env:Client',
        faultstring: 'Some descriptive message',
        detail: {
          code: '41',
          requestUUID: '11111111-1111-1111-1111-111111111111',
          responseUUID: '22222222-2222-2222-2222-222222222222',
        },
      });

      converter(error, req, res, nextFn);

      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(400);
      expect(res.json.mock.calls.length).toBe(1);
      expect(res.json.mock.calls[0][0].message).toBe(
        'Some descriptive message'
      );
      expect(res.json.mock.calls[0][0].data).toMatchObject({
        isFiscalization: true,
        fault: 'Client',
        code: '41',
        requestUUID: '11111111-1111-1111-1111-111111111111',
        responseUUID: '22222222-2222-2222-2222-222222222222',
      });
    });

    it('calls res with additional data on a ServerFiscalizationError', () => {
      const error = new ServerFiscalizationError({
        faultcode: 'env:Server',
        faultstring: 'Some descriptive message',
        detail: {
          code: '41',
          requestUUID: '11111111-1111-1111-1111-111111111111',
          responseUUID: '22222222-2222-2222-2222-222222222222',
        },
      });

      converter(error, req, res, nextFn);

      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(500);
      expect(res.json.mock.calls.length).toBe(1);
      expect(res.json.mock.calls[0][0].message).toBe(
        'Some descriptive message'
      );
      expect(res.json.mock.calls[0][0].data).toMatchObject({
        isFiscalization: true,
        fault: 'Server',
        code: '41',
        requestUUID: '11111111-1111-1111-1111-111111111111',
        responseUUID: '22222222-2222-2222-2222-222222222222',
      });
    });

    it('calls res with additional data on a FiscalizationError', () => {
      const error = new FiscalizationError(new Error('test'));

      converter(error, req, res, nextFn);

      expect(res.status.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(500);
      expect(res.json.mock.calls.length).toBe(1);
      expect(res.json.mock.calls[0][0].message).toBe('test');
      expect(res.json.mock.calls[0][0].data).toMatchObject({
        isFiscalization: true,
        fault: 'Unknown',
      });
    });
  });
});
