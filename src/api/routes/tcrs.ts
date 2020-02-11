import express from 'express';
import { validateBody } from '../middlewares/validator';
import { registerTCRPayloadSchema, cashBalancePayloadSchema } from './validation-schemas/tcrSchemas';
import { handleRegisterTCR, handleCashBalance } from '../controllers/tcr.controller';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.post(
  '/registerTCR',
  validateBody(registerTCRPayloadSchema),
  handleRegisterTCR
);

router.post(
  '/cashBalance',
  validateBody(cashBalancePayloadSchema),
  handleCashBalance
);

export default router;
