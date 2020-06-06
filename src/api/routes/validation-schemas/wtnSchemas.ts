import joi from '@hapi/joi';
import {
  WTN_TYPES,
  WTN_GROUP_TYPES,
  WTN_TRANSACTION_TYPES,
  VEH_OWNERSHIP_TYPES,
  WTN_LOCATION_TYPES,
  CARRIER_ID_TYPES,
} from '../../../types';

const transferNoteItemSchema = joi.object({
  name: joi.string().required(),
  code: joi.string(),
  unit: joi.string().required(),
  quantity: joi.number().min(1).required(),
});

export const registerWTNPayloadSchema = joi.object({
  wtnType: joi
    .string()
    .valid(...WTN_TYPES)
    .required(),
  groupOfGoods: joi
    .string()
    .valid(...WTN_GROUP_TYPES)
    .required(),
  transaction: joi
    .string()
    .valid(...WTN_TRANSACTION_TYPES)
    .required(),
  issueDateTime: joi.date().iso().required(),
  operatorCode: joi.string().required(),
  businUnitCode: joi.string().required(),
  wtnOrdNum: joi.number().required(),
  wtnNum: joi.string().required(),
  fuelPumNum: joi.string(),
  totPriceWoVAT: joi.number(),
  totVATAmt: joi.number(),
  totPrice: joi.number(),
  vehOwnership: joi
    .string()
    .valid(...VEH_OWNERSHIP_TYPES)
    .required(),
  vehPlates: joi.string().required(),
  startAddr: joi.string().required(),
  startCity: joi.string().required(),
  startPoint: joi
    .string()
    .valid(...WTN_LOCATION_TYPES)
    .required(),
  startDateTime: joi.date().iso().required(),
  destinAddr: joi.string().required(),
  destinCity: joi.string().required(),
  destinPoint: joi
    .string()
    .valid(...WTN_LOCATION_TYPES)
    .required(),
  destinDateTime: joi.date().iso().required(),
  isGoodsFlammable: joi.boolean().default(false),
  isEscortRequired: joi.boolean().default(false),
  packType: joi.string(),
  packNum: joi.number(),
  itemsNum: joi.number(),
  isAfterDel: joi.boolean().default(false),

  issuer: joi
    .object({
      nuis: joi
        .string()
        .regex(/[a-zA-Z]{1}[0-9]{8}[a-zA-Z]{1}/)
        .required(),
      name: joi.string().required(),
      address: joi.string().required(),
      town: joi.string().required(),
    })
    .required(),

  buyer: joi.object({
    nuis: joi
      .string()
      .regex(/[a-zA-Z]{1}[0-9]{8}[a-zA-Z]{1}/)
      .required(),
    name: joi.string().required(),
    address: joi.string().required(),
    town: joi.string().required(),
  }),

  carrier: joi.object({
    idNum: joi
      .string()
      .regex(/[a-zA-Z]{1}[0-9]{8}[a-zA-Z]{1}/)
      .required(),
    idType: joi
      .string()
      .valid(...CARRIER_ID_TYPES)
      .required(),
    name: joi.string().required(),
    address: joi.string(),
    town: joi.string(),
  }),
  items: joi.array().items(transferNoteItemSchema).min(1).required(),
});
