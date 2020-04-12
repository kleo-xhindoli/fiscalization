import express from 'express';
import { validateBody } from '../middlewares/validator';
import {
  createInvoicePayloadSchema,
  createRawInvoicePayloadSchema,
} from './validation-schemas/invoiceSchemas';
import {
  handleRegisterInvoice,
  handleRawInvoice,
  handleRawInvoiceExport,
} from '../controllers/invoice.controller';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.post(
  '/register',
  validateBody(createInvoicePayloadSchema),
  handleRegisterInvoice
);

router.post(
  '/registerRaw',
  validateBody(createRawInvoicePayloadSchema),
  handleRawInvoice
);

router.post(
  '/export',
  validateBody(createRawInvoicePayloadSchema),
  handleRawInvoiceExport
);

export default router;
