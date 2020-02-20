import express from 'express';
import { validateBody } from '../middlewares/validator';
import { createInvoicePayloadSchema } from './validation-schemas/invoiceSchemas';
import {
  handleRegisterInvoice,
  handleModifyInvoice,
} from '../controllers/invoice.controller';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.post(
  '/register',
  validateBody(createInvoicePayloadSchema),
  handleRegisterInvoice
);

router.post(
  '/modify/:iic',
  validateBody(createInvoicePayloadSchema),
  handleModifyInvoice
);

export default router;
