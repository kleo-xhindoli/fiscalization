import joi from '@hapi/joi';

const transferNoteItemSchema = joi.object({
  name: joi.string().required(),
  code: joi.string(),
  unit: joi.string().required(),
  quantity: joi.number().min(1).required(),
});

export const registerWTNPayloadSchema = joi.object({
  dateTimeCreated: joi.date().iso().required(),
  wtnNum: joi.number().required(),
  operatorCode: joi.string().required(),
  businUnit: joi.string().required(),
  startAddr: joi.string().required(),
  startCity: joi.string().required(),
  destinAddr: joi.string().required(),
  destinCity: joi.string().required(),
  isAfterDel: joi.boolean(),
  transDate: joi.date().iso().required(),
  carrierId: joi.string(),
  vehPlates: joi.string().required(),
  issuer: joi
    .object({
      nuis: joi
        .string()
        .regex(/[a-zA-Z]{1}[0-9]{8}[a-zA-Z]{1}/)
        .required(),
      name: joi.string().required(),
    })
    .required(),
  items: joi.array().items(transferNoteItemSchema).min(1).required(),
});
