import joi from '@hapi/joi';

import {
  validateBody,
  validateQueryParams,
  validateCertificates,
} from '../../../../api/middlewares/validator';

const nextFn = jest.fn();
let req: any = {};
let res: any = {};

describe('Unit | Middleware | Validator', () => {
  describe('validateBody', () => {
    beforeEach(() => {
      nextFn.mockClear();
      req = {
        body: {
          name: 'John Doe',
          hasAuth: false,
          age: 36,
        },
      };
      res = {};
    });

    it(`calls next with the validation error when one or more body 
      fields dont match the schema types`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          age: joi.number(),
          hasAuth: joi.number(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
      expect(nextFn.mock.calls[0][0].message).toContain('hasAuth');
    });

    it(`calls next with the validation error when one or more required
      properties are missing from the body`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          age: joi.number(),
          hasAuth: joi.boolean(),
          birthday: joi.string().required(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
      expect(nextFn.mock.calls[0][0].message).toContain('birthday');
    });

    it(`calls next with the validation error when one or more fields
      doesnt meet the schema constraints`, () => {
      validateBody(
        joi.object({
          name: joi.string().min(60),
          age: joi.number(),
          hasAuth: joi.boolean(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
      expect(nextFn.mock.calls[0][0].message).toContain('name');
    });

    it(`calls next with the validation error when the body has one
      or more fields not specified in the schema`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          age: joi.number(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
      expect(nextFn.mock.calls[0][0].message).toContain('hasAuth');
    });

    it(`calls next with the validation error when a field does not have a valid
      allowed value`, () => {
      req.body = {
        ...req.body,
        employmentStatus: 'Invalid',
      };

      validateBody(
        joi.object({
          name: joi.string(),
          employmentStatus: joi.string().valid('Employed', 'Unemployed'),
          hasAuth: joi.boolean(),
          age: joi.number(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
      expect(nextFn.mock.calls[0][0].message).toContain('employmentStatus');
    });

    it(`calls next with no error when a field has a valid allowed value`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          employmentStatus: joi.string().valid('Employed', 'Unemployed'),
          hasAuth: joi.boolean(),
          age: joi.number(),
        })
      )({ ...req, employmentStatus: 'Employed' }, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeUndefined();
    });

    it(`calls next with no errors if one or more non-required fields
      are missing from the body`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          age: joi.number(),
          hasAuth: joi.boolean(),
          birthday: joi.string(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeUndefined();
    });

    it(`sets the validatedBody property in the req object`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          age: joi.number(),
          hasAuth: joi.boolean(),
        })
      )(req, res, nextFn);

      expect(req.validatedBody).toMatchObject(req.body);
    });

    it(`populates the validatedBody property in the req object 
      with the default values specified in the schema`, () => {
      validateBody(
        joi.object({
          name: joi.string(),
          age: joi.number(),
          hasAuth: joi.boolean(),
          employmentStatus: joi.string().default('Unemployed'),
        })
      )(req, res, nextFn);

      expect(req.validatedBody).toMatchObject({
        ...req.body,
        employmentStatus: 'Unemployed',
      });
    });
  });

  describe('validateQueryParams', () => {
    beforeEach(() => {
      nextFn.mockClear();
      req = {
        query: {
          page: 23,
          sort: 'title',
          limit: 90,
        },
      };
      res = {};
    });

    it(`calls next with the validation error when one or more query 
      fields dont match the schema types`, () => {
      validateQueryParams(
        joi.object({
          page: joi.number(),
          sort: joi.string(),
          limit: joi.object(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
    });

    it(`calls next with the validation error when one or more required
      properties are missing from the query`, () => {
      validateQueryParams(
        joi.object({
          page: joi.number(),
          sort: joi.string(),
          limit: joi.number(),
          filter: joi.string().required(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
    });

    it(`calls next with the validation error when one or more fields
      doesnt meet the schema constraints`, () => {
      validateQueryParams(
        joi.object({
          page: joi.number().max(5),
          sort: joi.string(),
          limit: joi.number(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
    });

    it(`calls next with the validation error when the query has one
      or more fields not specified in the schema`, () => {
      validateQueryParams(
        joi.object({
          sort: joi.string(),
          limit: joi.number(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toHaveProperty('isJoi', true);
    });

    it(`calls next with no errors if one or more non-required fields
      are missing from the query`, () => {
      validateQueryParams(
        joi.object({
          page: joi.number().required(),
          sort: joi.string().required(),
          limit: joi.number(),
          filter: joi.string(),
        })
      )(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeUndefined();
    });

    it(`sets the validatedQueryParams property in the req object`, () => {
      validateQueryParams(
        joi.object({
          page: joi.number(),
          sort: joi.string(),
          limit: joi.number(),
        })
      )(req, res, nextFn);

      expect(req.validatedQueryParams).toMatchObject(req.query);
    });

    it(`populates the validatedQueryParams property in the req object 
      with the default values specified in the schema`, () => {
      validateQueryParams(
        joi.object({
          page: joi.number(),
          sort: joi.string(),
          limit: joi.number(),
          filter: joi.string().default('createdBy'),
        })
      )(req, res, nextFn);

      expect(req.validatedQueryParams).toMatchObject({
        ...req.query,
        filter: 'createdBy',
      });
    });
  });

  describe('validateCertificates', () => {
    beforeEach(() => {
      nextFn.mockClear();
      req = {
        query: {
          page: 23,
          sort: 'title',
          limit: 90,
        },
      };
      res = {};
    });

    it(`calls next with no arguments when the rquest contains the certificates 
      and payload`, () => {
      req = {
        body: {
          payload: {},
          certificates: {
            privateKey: 'Test',
            certificate: 'Test',
          },
        },
      };

      validateCertificates(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeUndefined();
    });

    it(`sets the privateKey and certificate properties in the request object`, () => {
      req = {
        body: {
          payload: {},
          certificates: {
            privateKey: 'Test',
            certificate: 'Cert',
          },
        },
      };

      validateCertificates(req, res, nextFn);

      expect(req.privateKey).toBe('Test');
      expect(req.certificate).toBe('Cert');
    });

    it(`sets the body of the request to be the payload after validation`, () => {
      req = {
        body: {
          payload: {
            example: 'test',
            two: 2,
          },
          certificates: {
            privateKey: 'Test',
            certificate: 'Cert',
          },
        },
      };

      validateCertificates(req, res, nextFn);

      expect(req.body).toMatchObject({
        example: 'test',
        two: 2,
      });
    });

    it(`calls next with an argument when the certificates property is missing`, () => {
      req = {
        body: {
          payload: {},
        },
      };

      validateCertificates(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeDefined();
    });

    it(`calls next with an argument when the payload property is missing`, () => {
      req = {
        body: {
          certificates: {
            privateKey: 'Test',
            certificate: 'Cert',
          },
        },
      };

      validateCertificates(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeDefined();
    });

    it(`calls next with an argument when the certificate prop is missing`, () => {
      req = {
        body: {
          payload: {},
          certificates: {
            certificate: 'Cert',
          },
        },
      };

      validateCertificates(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeDefined();
    });
    it(`calls next with an argument when the certificate prop is missing`, () => {
      req = {
        body: {
          payload: {},
          certificates: {
            privateKey: 'Key',
          },
        },
      };

      validateCertificates(req, res, nextFn);

      expect(nextFn.mock.calls.length).toBe(1);
      expect(nextFn.mock.calls[0][0]).toBeDefined();
    });
  });
});
