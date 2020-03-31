import joi from 'joi';
import { TCR_TYPES, TCR_TYPE_REGULAR } from '../../../types';

export const registerTCRPayloadSchema = {
  businUnitCode: joi.string().required(),
  issuerNUIS: joi.string().required(), // TODO: NUIS regex
  tcrIntID: joi
    .number()
    .min(1)
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
  issuerNUIS: joi.string().required(), // TODO: NUIS regex
  operation: joi
    .string()
    .valid(['INITIAL', 'INOUT'])
    .required(),
  tcrCode: joi.string().required(),
  isSubseqDeliv: joi.boolean().default(false),
};
