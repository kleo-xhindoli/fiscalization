import express from 'express';
import { validateBody } from '../middlewares/validator';
import { registerWTNPayloadSchema } from './validation-schemas/wtnSchemas';
import { handleRegisterWTN } from '../controllers/wtn.controller';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.post(
  '/registerWTN',
  validateBody(registerWTNPayloadSchema),
  handleRegisterWTN
);

export default router;
