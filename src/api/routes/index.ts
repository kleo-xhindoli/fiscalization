import express from 'express';
import auth from '../middlewares/auth';

import tcrRouter from './tcrs';
import invoiceRouter from './invoices';
import wtnRouter from './wtns';
import { validateCertificates } from '../middlewares/validator';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use(auth);
router.use(validateCertificates);

router.use('/tcrs', tcrRouter);
router.use('/invoices', invoiceRouter);
router.use('/wtns', wtnRouter);

export default router;
