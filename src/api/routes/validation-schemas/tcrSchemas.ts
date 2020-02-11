import joi from 'joi';

export const registerTCRPayloadSchema = {
  businUnit: joi.string().required(),
  issuerNUIS: joi.string().required(), // TODO: NUIS regex
  regDateTime: joi
    .date()
    .iso()
    .max('now')
    .required(),
  tcrOrdNum: joi
    .number()
    .min(1)
    .required(),
};

export const cashBalancePayloadSchema = {
  balChkDatTim: joi
    .date()
    .iso()
    .max('now')
    .required(),
  cashAmt: joi
    .number()
    .min(0)
    .required(),
  issuerNUIS: joi.string().required(), // TODO: NUIS regex
  operation: joi
    .string()
    .valid(['Balance', 'Deposit', 'Credit'])
    .required(),
  tcrNumber: joi.string().required(),
};
