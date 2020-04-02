import joi from 'joi';
import {
  INVOICE_TYPES,
  SELF_ISS_TYPES,
  INVOICE_TYPE_CASH,
  PAYMENT_METHOD_TYPES,
  ID_TYPES,
  EXEMPT_FROM_VAT_TYPES,
  CORRECTIVE_INVOICE_TYPES,
  FEE_TYPES,
} from '../../../types';
import { ALLOWED_COUNTRY_CODES } from '../../../types/country-codes';
import { ALLOWED_CURRENCY_CODES } from '../../../types/currency-codes';

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
  exemptFromVAT: joi.string().valid(EXEMPT_FROM_VAT_TYPES),
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

const voucherSchema = joi.object({
  num: joi.string(),
});

const payMethodSchema = joi.object({
  type: joi
    .string()
    .valid(PAYMENT_METHOD_TYPES)
    .required(),
  amt: joi.number(),
  compCard: joi.string().max(50),
  vouchers: joi.array().items(voucherSchema),
});

const feeSchema = joi.object({
  type: joi
    .string()
    .valid(FEE_TYPES)
    .required(),
  amt: joi.number().required(),
});

const summaryIICRefSchema = joi.object({
  iic: joi.string().required(),
  issueDateTime: joi
    .string()
    .regex(
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}/
    )
    .required(),
});

export const createInvoicePayloadSchema = {
  typeOfInv: joi
    .string()
    .valid(INVOICE_TYPES)
    .required(),
  isSimplifiedInv: joi.boolean().default(false),
  typeOfSelfIss: joi.string().valid(SELF_ISS_TYPES),
  issueDateTime: joi
    .date()
    .iso()
    .required(),
  invOrdNum: joi
    .number()
    .min(1)
    .required(),
  tcrCode: joi.when('typeOfInv', {
    is: INVOICE_TYPE_CASH, // rquired only for cash invoices
    then: joi.string().required(),
    otherwise: joi.string(),
  }),
  isIssuerInVAT: joi.boolean().default(true),
  taxFreeAmt: joi.when('isIssuerInVAT', {
    is: false,
    then: joi.number().required(),
    otherwise: joi.number(),
  }),
  markUpAmt: joi.number(),
  goodsExAmt: joi.number(),
  operatorCode: joi.string().required(),
  businUnitCode: joi.string().required(),
  isSubseqDeliv: joi.boolean(),
  isReverseCharge: joi.boolean(),
  isBadDebt: joi.boolean(),
  payDeadline: joi
    .date()
    .iso()
    .min('now'),
  currency: joi.object({
    code: joi
      .string()
      .required()
      .valid(ALLOWED_CURRENCY_CODES),
    exRate: joi.number().required(),
  }),
  supplyDateOrPeriod: joi.object({
    start: joi
      .date()
      .iso()
      .required(),
    end: joi
      .date()
      .iso()
      .required(),
  }),
  correctiveInvoice: joi.object({
    iicRef: joi.string().required(),
    issueDateTime: joi
      .string()
      .regex(
        /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}/
      )
      .required(),
    type: joi
      .string()
      .valid(CORRECTIVE_INVOICE_TYPES)
      .required(),
  }),
  seller: joi
    .object({
      idType: joi
        .string()
        .valid(ID_TYPES)
        .required(),
      idNum: joi.string().required(),
      name: joi.string().required(),
      address: joi.string(),
      town: joi.string(),
      country: joi.string().valid(ALLOWED_COUNTRY_CODES),
    })
    .required(),
  buyer: joi.when('typeOfSelfIss', {
    is: joi.string().required(), // when typeOfSelfIss is defined
    then: joi
      .object({
        idType: joi
          .string()
          .valid(ID_TYPES)
          .required(),
        idNum: joi.string().required(),
        name: joi.string().required(),
        address: joi.string(),
        town: joi.string(),
        country: joi.string().valid(ALLOWED_COUNTRY_CODES),
      })
      .required(),
    otherwise: joi.object({
      idType: joi.string().valid(ID_TYPES),
      idNum: joi.string(),
      name: joi.string(),
      address: joi.string(),
      town: joi.string(),
      country: joi.string().valid(ALLOWED_COUNTRY_CODES),
    }),
  }),

  payMethods: joi
    .array()
    .items(payMethodSchema)
    .min(1)
    .required(),
  items: joi
    .array()
    .items(invoiceItemSchema)
    .default([]),

  consTaxes: joi.array().items(consumptionTaxItemsSchema),
  fees: joi.array().items(feeSchema),
  sumIICRefs: joi.array().items(summaryIICRefSchema),
};

const sameTaxGroupSchema = joi.object({
  VATRate: joi.number().required(),
  numOfItems: joi.number().required(),
  priceBeforeVAT: joi.number().required(),
  VATAmt: joi.number().required(),
  exemptFromVAT: joi.string().valid(EXEMPT_FROM_VAT_TYPES),
});

const rawInvoiceItemSchema = invoiceItemSchema.keys({
  unitPriceWithVAT: joi.number().required(),
  priceBeforeVAT: joi.number().required(),
  VATAmount: joi.number().required(),
  priceAfterVAT: joi.number().required(),
});

const rawConsumptionTaxItemsSchema = consumptionTaxItemsSchema.keys({
  consTaxAmount: joi.number().required(),
});

export const createRawInvoicePayloadSchema = {
  ...createInvoicePayloadSchema,

  invNum: joi.string().required(),
  totPriceWoVAT: joi.number().required(),
  totVATAmt: joi.number().required(),
  totPrice: joi.number().required(),
  iic: joi.string().required(),
  iicSignature: joi.string().required(),
  sameTaxes: joi
    .array()
    .items(sameTaxGroupSchema)
    .default([]),
  items: joi
    .array()
    .items(rawInvoiceItemSchema)
    .default([]),
  constTaxes: joi.array().items(rawConsumptionTaxItemsSchema),
};
