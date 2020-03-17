import joi from 'joi';

export const registerTCRPayloadSchema = {
  businUnitCode: joi.string().required(),
  issuerNUIS: joi.string().required(), // TODO: NUIS regex
  tcrIntID: joi
    .number()
    .min(1)
    .required(),
  validFrom: joi.date().iso(),
  validTo: joi.date().iso(),
};

export const cashBalancePayloadSchema = {
  changeDateTime: joi
    .date()
    .iso()
    .max('now')
    .required(),
  cashAmt: joi
    .number()
    .required(),
  issuerNUIS: joi.string().required(), // TODO: NUIS regex
  operation: joi
    .string()
    .valid(['INITIAL', 'INOUT'])
    .required(),
  tcrCode: joi.string().required(),
  isSubseqDeliv: joi.boolean().default(false),
};
