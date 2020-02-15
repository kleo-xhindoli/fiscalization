import joi from 'joi';
import {
  INVOICE_TYPES,
  SELF_ISS_TYPES,
  INVOICE_TYPE_CASH,
  PAYMENT_METHOD_TYPES,
} from '../../../types';

const invoiceItemSchema = joi.object({
  name: joi.string().required(),
  code: joi.string(),
  unitOfMeasure: joi.string().required(),
  quantity: joi.number().required(),
  unitPrice: joi.number().required(),
  rebate: joi.number(), // Percentage (e.g. 20.00)
  rebateReducingBasePrice: joi.when('rebate', {
    is: joi.number().required(), // when rebate has a numeric value
    then: joi.boolean().required(),
    otherwise: joi.forbidden(),
  }),
  VATRate: joi.number().required(),
});

const consumptionTaxItemsSchema = joi.object({
  consTaxRate: joi.number().required(), // percentage (e.g. 10.00),
  numOfItems: joi
    .number()
    .min(1)
    .required(),
  priceBefConsTax: joi.number().required(),
});

export const createInvoicePayloadSchema = {
  typeOfInv: joi
    .string()
    .valid(INVOICE_TYPES)
    .required(),
  selfIssuing: joi.boolean().default(false),
  typeOfSelfIss: joi.when('selfIssuing', {
    is: true, // allow only when 'selfIssuing' is true
    then: joi
      .string()
      .allow(SELF_ISS_TYPES)
      .required(),
    otherwise: joi.forbidden(),
  }),
  dateTimeCreated: joi
    .date()
    .iso()
    .required(),
  invOrdNum: joi
    .number()
    .min(1)
    .required(),
  cashRegister: joi.when('typeOfInv', {
    is: INVOICE_TYPE_CASH, // rquired only for cash invoices
    then: joi.string().required(),
    otherwise: joi.string(),
  }),
  issuerInVAT: joi.boolean().default(true),
  taxFreeAmt: joi.number().default(0),
  markUpAmt: joi.number(),
  goodsExport: joi.number(),
  paymentMeth: joi
    .string()
    .allow(PAYMENT_METHOD_TYPES)
    .required(),
  operatorCode: joi.string().required(),
  businUnit: joi.string().required(),
  isSubseqDeliv: joi.boolean(),
  reverseCharge: joi.boolean(),
  badDebt: joi.boolean(),
  issuer: joi
    .object({
      NUIS: joi.string().required(), // TODO: regex
      name: joi.string().required(),
      address: joi.string().required(),
      town: joi.string().required(),
      country: joi.string().default('Albania'),
    })
    .required(),
  buyer: joi.when('selfIssuing', {
    is: true,
    then: joi
      .object({
        NUIS: joi.string().required(), // TODO: regex
        name: joi.string().required(),
        address: joi.string().required(),
        town: joi.string().required(),
        country: joi.string().default('Albania'),
      })
      .required(),
    otherwise: joi.object({
      NUIS: joi.string(), // TODO: regex
      name: joi.string(),
      address: joi.string(),
      town: joi.string(),
      country: joi.string(),
    }),
  }),
  items: joi
    .array()
    .items(invoiceItemSchema)
    .default([]),

  consumptionTaxItems: joi.array().items(consumptionTaxItemsSchema),
};
