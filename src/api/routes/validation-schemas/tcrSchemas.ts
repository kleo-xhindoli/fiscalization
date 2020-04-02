import joi from 'joi';
import { TCR_TYPES, TCR_TYPE_REGULAR } from '../../../types';

export const registerTCRPayloadSchema = {
  businUnitCode: joi.string().required(),
  issuerNUIS: joi
    .string()
    .regex(/[a-zA-Z]{1}[0-9]{8}[a-zA-Z]{1}/)
    .required(),
  tcrIntID: joi
    .string()
    .min(1)
    .max(50)
    .required(),
  validFrom: joi.date().iso(),
  validTo: joi.date().iso(),
  type: joi
    .string()
    .valid(TCR_TYPES)
    .default(TCR_TYPE_REGULAR),
};

export const cashBalancePayloadSchema = {
  changeDateTime: joi
    .date()
    .iso()
    .max('now')
    .required(),
  cashAmt: joi.when('operation', {
    // Allow negative values only when operation is INOUT
    is: 'INOUT',
    then: joi.number().required(),
    otherwise: joi
      .number()
      .min(0)
      .required(),
  }),
  issuerNUIS: joi
    .string()
    .regex(/[a-zA-Z]{1}[0-9]{8}[a-zA-Z]{1}/)
    .required(),
  operation: joi
    .string()
    .valid(['INITIAL', 'INOUT'])
    .required(),
  tcrCode: joi.string().required(),
  isSubseqDeliv: joi.boolean().default(false),
};
